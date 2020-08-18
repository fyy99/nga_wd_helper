// ==UserScript==
// @namespace         https://github.com/fyy99/nga_wd_helper
// @name              nga_wd_helper
// @name:zh           NGA版主助手
// @name:zh-CN        NGA版主助手
// @description       https://bbs.nga.cn/
// @description:zh    https://bbs.nga.cn/
// @description:zh-CN https://bbs.nga.cn/
// @version           0.14
// @author            fyy99
// @match             *://ngabbs.com/*
// @match             *://bbs.nga.cn/*
// @match             *://nga.178.com/*
// @run-at            document-end
// @note              v0.10 初始版本：回帖批量锁隐功能完成
// @note              v0.11 更换选中方式 & 插件不会在无管理权限的版面生效
// @note              v0.12 优化选中样式 & 支持帖子属性面板的其他操作
// @note              v0.13 bugfix
// @note              v0.14 批量加分 & 自动修改域名
// @grant             none
// ==/UserScript==

(function() {
    'use strict';
    // 跳转
    if (!document.location.href.includes('ngabbs.com')) {
        // ngabbs.com是客户端用的域名，兼容性最好
        document.location.href = document.location.href.replace('bbs.nga.cn', 'ngabbs.com').replace('nga.178.com','ngabbs.com');
    }
    // 读帖页面
    if (document.location.href.includes('read.php')) {
        // class/style
        const nga_wd_helper_style = document.createElement('style');
        nga_wd_helper_style.type = 'text/css';
        nga_wd_helper_style.innerHTML = "span[id^=postdate][class*=stxt]{font-weight:bold;cursor:pointer;} span[id^=postdate][class*=stxt][style*=darkred]{color:orangered !important;text-decoration:underline;} span[id^=postdate][class*=stxt][style*=darkred]:before{content:'\\2714  '}";
        document.head.appendChild(nga_wd_helper_style);
        // select
        const getSelectedPids = (tid = false) => {
            const pids = document.querySelectorAll("span[id^=postdate][class*=stxt][style*=darkred]");
            const ids = [];
            for (let pid of pids) {
                if (pid.parentNode && pid.parentNode.parentNode && pid.parentNode.parentNode.firstChild && pid.parentNode.parentNode.firstChild.id.startsWith('pid')){
                    const pid_regexp = new RegExp('pid([0-9]+)Anchor').exec(pid.parentNode.parentNode.firstChild.id);
                    if (pid_regexp && pid_regexp[1]) {
                        if (tid) {
                            ids.push(tid);
                        }
                        ids.push(pid_regexp[1]);
                    }
                }
            }
            return ids;
        };
        // click
        document.addEventListener('click', (e) => {
            if ((e.target || e.srcElement) && (e.target || e.srcElement).id.startsWith('postdate')) {
                // new button
                if ((window.__GP.admincheck & 2) && !document.querySelector('#nga_wd_helper_pids_del')) {
                    const td_pids_add = document.createElement('td');
                    td_pids_add.innerHTML = '<a href="javascript:void(0)" class="cell rep txtbtnx nobr silver" title="帖子批量加分" id="nga_wd_helper_pids_add">批量操作(加分)</a>';
                    td_pids_add.addEventListener('click', () => {
                        const fid = window.__CURRENT_FID;
                        const tid = window.__CURRENT_TID;
                        const pids = getSelectedPids();
                        if (pids.length == 0) {
                            alert('没有任何有效的选中项目');
                            return;
                        }
                        let opt = 4194304;
                        switch (prompt("1:声望威望金钱  2:声望威望  3:声望金钱  4:声望\n其他选项视为取消操作\n该操作将发送PM", "1")) {
                            case '1':
                                opt = 4194304 + 4 + 2 + 1;
                                break;
                            case '2':
                                opt = 4194304 + 4 + 2;
                                break;
                            case '3':
                                opt = 4194304 + 4 + 1;
                                break;
                            case '4':
                                opt = 4194304 + 4;
                                break;
                            default:
                                alert('您已取消操作');
                                return;
                        }
                        const value = prompt("请填写声望(-1500~1500)并确认\n\n加分过程中不要关闭窗口或离开本页面\n操作完成后会有弹窗提示", "15");
                        if (!value) {
                            alert('您已取消操作');
                            return;
                        }
                        let results = '';
                        const mas = function (pids) {
                            if (pids.length) {
                                const pid = pids.shift();
                                window.__NUKE.doRequest({
                                    u: {u: window.__API._base,
                                        a: {__lib:"add_point_v3",__act:"add",opt:opt,fid:fid,tid:tid,pid:pid,info:'',value:value,raw:3,nga_wd_helper_pids_add:1}},
                                    f: function(d) {
                                        const result = `pid:${pid} ${d.error ? d.error[0] : d.data[0]}`;
                                        results += result + '\n';
                                        console.log(result);
                                        mas(pids);
                                    }
                                });
                            } else {
                                alert(`批量操作完成\n\n${results}`);
                            }
                        }
                        mas(pids);
                    });
                    document.querySelector("#postbbtm > table > tbody > tr").appendChild(td_pids_add);
                    const td_pids_del = document.createElement('td');
                    td_pids_del.innerHTML = '<a href="javascript:void(0)" class="cell rep txtbtnx nobr silver" title="批量设置帖子属性" id="nga_wd_helper_pids_del">批量操作(属性)</a>';
                    td_pids_del.addEventListener('click', () => {
                        const fid = window.__CURRENT_FID;
                        const tid = window.__CURRENT_TID;
                        const ids = getSelectedPids(tid);
                        if (ids.length == 0) {
                            alert('没有任何有效的选中项目');
                            return;
                        }
                        let pon = 0;
                        let poff = 0;
                        switch (prompt("1:锁隐  2:锁定  3:隐藏\n4:解除锁隐  5:编辑许可  6:通过审核\n其他选项视为取消操作\n该操作不会发送PM", "1")) {
                            case '1':
                                pon = 1026;
                                break;
                            case '2':
                                pon = 1024;
                                break;
                            case '3':
                                pon = 2;
                                break;
                            case '4':
                                poff = 1026;
                                break;
                            case '5':
                                pon = 128;
                                break;
                            case '6':
                                poff = 67109376;
                                break;
                            default:
                                alert('您已取消操作');
                                return;
                        }
                        window.__NUKE.doRequest({
                            u: {u: window.__API._base,
                                a: {__lib:"topic_lock",__act:"set",ids:ids.join(','),ton:0,toff:0,pon:pon,poff:poff,pm:'',info:'',delay:'',cfid:fid,raw:3,nga_wd_helper_pids_del:1}},
                            f: function(d) {
                                let result = '批量操作完成\n\n';
                                for (let i in d.error) {
                                    result += d.error[i] + '\n';
                                }
                                for (let i in d.data) {
                                    result += d.data[i] + '\n';
                                }
                                console.log(result);
                                alert(result);
                            }
                        });
                    });
                    document.querySelector("#postbbtm > table > tbody > tr").appendChild(td_pids_del);
                }
            }
        });
    }
})();
