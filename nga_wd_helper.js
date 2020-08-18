// ==UserScript==
// @namespace         https://github.com/fyy99/nga_wd_helper
// @name              nga_wd_helper
// @name:zh           NGA版主助手
// @name:zh-CN        NGA版主助手
// @description       https://bbs.nga.cn/
// @description:zh    https://bbs.nga.cn/
// @description:zh-CN https://bbs.nga.cn/
// @version           0.11
// @author            fyy99
// @match             *://bbs.nga.cn/read.php*
// @match             *://ngabbs.com/read.php*
// @match             *://nga.178.com/read.php*
// @run-at            document-end
// @note              v0.10 初始版本：回帖批量锁隐功能完成
// @note              v0.11 更换选中方式 & 插件不会在无管理权限的版面生效
// @grant             none
// ==/UserScript==

(function() {
    'use strict';
    // click
    document.addEventListener('click', (e) => {
        if ((e.target || e.srcElement) && (e.target || e.srcElement).id.startsWith('postdate')) {
            // new button
            if ((window.__GP.admincheck & 2) && !document.querySelector('#nga_wd_helper_pids_del')) {
                const td = document.createElement('td');
                td.innerHTML = '<a href="javascript:void(0)" class="cell rep txtbtnx nobr silver" title="脚本批量锁隐" id="nga_wd_helper_pids_del">回帖批量锁隐</a>';
                td.addEventListener('click', () => {
                    const fid = window.__CURRENT_FID;
                    const tid = window.__CURRENT_TID;
                    const pids = document.querySelectorAll("span[id^=postdate][class*=stxt][style*=darkred]");
                    const ids = [];
                    for (let pid of pids) {
                        if (pid.parentNode && pid.parentNode.parentNode && pid.parentNode.parentNode.firstChild && pid.parentNode.parentNode.firstChild.id.startsWith('pid')){
                            const pid_regexp = new RegExp('pid([0-9]+)Anchor').exec(pid.parentNode.parentNode.firstChild.id);
                            if (pid_regexp && pid_regexp[1]) {
                                ids.push(tid);
                                ids.push(pid_regexp[1]);
                            }
                        }
                    }
                    const fd = new FormData();
                    const xr = new XMLHttpRequest();
                    xr.onload = function (e) {
                        const xhr = e.target;
                        if (xhr.readyState === 4 && xhr.status === 200 && xhr.responseText.includes('操作成功')) {
                            const data_regexp = new RegExp('"data":{(.*?)},"time":').exec(xhr.responseText);
                            if (data_regexp && data_regexp[1]) {
                                alert(data_regexp[1].replace(/,/g, '\n'));
                            } else {
                                console.error(ids);
                                console.error(xhr.status, xhr.responseText);
                                alert('出现了一些问题[#1]，可以在控制台(F12)查看报错');
                            }
                        } else {
                            console.error(ids);
                            console.error(xhr.status, xhr.responseText);
                            alert('出现了一些问题[#2]，可以在控制台(F12)查看报错');
                        }
                    }
                    xr.open("POST", `/nuke.php?__lib=topic_lock&__act=set&ids=${ids.join('%2C')}&ton=0&toff=0&pon=1026&poff=0&pm=&info=&delay=&cfid=${fid}&raw=3&nga_wd_helper_pids_del=1`);
                    xr.withCredentials = true;
                    xr.send(fd);
                });
                document.querySelector("#postbbtm > table > tbody > tr").appendChild(td);
            }
        }
    });
})();
