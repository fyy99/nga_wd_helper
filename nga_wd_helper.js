// ==UserScript==
// @namespace         https://github.com/fyy99/nga_wd_helper
// @name              nga_wd_helper
// @name:zh           NGA版主助手
// @name:zh-CN        NGA版主助手
// @description       https://bbs.nga.cn/
// @description:zh    https://bbs.nga.cn/
// @description:zh-CN https://bbs.nga.cn/
// @version           0.10
// @author            fyy99
// @match             *://bbs.nga.cn/read.php*
// @match             *://ngabbs.com/read.php*
// @match             *://nga.178.com/read.php*
// @run-at            document-end
// @note              v0.10 初始版本：回帖批量锁隐功能完成
// @grant             none
// ==/UserScript==

(function() {
    'use strict';
    const commonui = window.commonui;
    // new class
    const block_txt_c0_chosen = document.createElement('style');
    block_txt_c0_chosen.type = 'text/css';
    block_txt_c0_chosen.innerHTML = ".block_txt_c0_orange{background-color:#ff7505;}";
    document.head.appendChild(block_txt_c0_chosen);
    // click
    document.addEventListener('click', (e) => {
        const h = commonui.parentAHerf(e.target || e.srcElement);
        if (h && h.classList.contains("small_colored_text_btn") && h.classList.contains("stxt") && h.classList.contains("block_txt_c0") && h.classList.contains("vertmod") && h.name.startsWith('l')) {
            // new button
            if (!document.querySelector('#nga_wd_helper_pids_del')) {
                const show_input = document.createElement('input');
                show_input.style.width = '9em';
                show_input.placeholder = '将在此显示锁隐结果';
                document.querySelector("#postbbtm").appendChild(show_input);
                const td = document.createElement('td');
                td.innerHTML = '<a href="javascript:void(0)" class="cell rep txtbtnx nobr silver" title="脚本批量锁隐" id="nga_wd_helper_pids_del">回帖批量锁隐</a>';
                td.addEventListener('click', (e) => {
                    let all = 0;
                    let ok = 0;
                    for (let h of document.querySelectorAll("a.small_colored_text_btn.stxt.block_txt_c0.vertmod[name^=l].block_txt_c0_orange")) {
                        all++;
                        if (!(h.parentNode && h.parentNode.parentNode && h.parentNode.parentNode.parentNode && h.parentNode.parentNode.parentNode.parentNode && h.parentNode.parentNode.parentNode.parentNode.nextElementSibling && h.parentNode.parentNode.parentNode.parentNode.nextElementSibling.firstChild && h.parentNode.parentNode.parentNode.parentNode.nextElementSibling.firstChild.nodeName === 'A' && h.parentNode.parentNode.parentNode.parentNode.nextElementSibling.firstChild.id.startsWith('pid'))){
                            show_input.value += `未知pid(失败),`;
                            continue;
                        }
                        const pid_regexp = new RegExp('pid([0-9]+)Anchor').exec(h.parentNode.parentNode.parentNode.parentNode.nextElementSibling.firstChild.id);
                        if (pid_regexp && pid_regexp[1]) {
                            const fid = window.__CURRENT_FID;
                            const tid = window.__CURRENT_TID;
                            const pid = pid_regexp[1];
                            // work!
                            var fd = new FormData();
                            var xr = new XMLHttpRequest();
                            xr.onload = function (e) {
                                const xhr = e.target;
                                if (xhr.readyState === 4 && xhr.status === 200 && xhr.responseText.includes('操作成功')) {
                                    show_input.value += `${pid},`;
                                } else {
                                    show_input.value += `${pid}(失败),`;
                                    console.log(pid, xhr.status, xhr.responseText);
                                }
                            }
                            xr.open("POST", `/nuke.php?__lib=topic_lock&__act=set&ids=${tid}%2C${pid}&ton=0&toff=0&pon=1026&poff=0&pm=&info=&delay=&cfid=${fid}&raw=3&nga_wd_helper_pids_del=1`);
                            xr.withCredentials = true;
                            xr.send(fd);
                        }
                    }
                });
                document.querySelector("#postbbtm > table > tbody > tr").appendChild(td);
            }
            if (h.classList.contains("block_txt_c0_orange")) {
                h.classList.remove('block_txt_c0_orange');
            } else {
                h.classList.add('block_txt_c0_orange');
            }
            e.returnValue = false
            e.cancelBubble = true;
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });
})();
