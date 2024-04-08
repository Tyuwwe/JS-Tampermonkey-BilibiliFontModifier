// ==UserScript==
// @name         Bilibili Subtitle Font Modifier
// @namespace    http://tampermonkey.net/
// @version      0.4c
// @description  try to take over the world!
// @author       Zeki Luan
// @match        https://www.bilibili.com/video/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @grant        none
// ==/UserScript==

window.addEventListener('load', function() {
    'use strict';
    // 在页面上添加一个用于选择字体的下拉列表
    const fontSelectUI = document.createElement('div');
    fontSelectUI.setAttribute("id", "FontSelectUI")
    fontSelectUI.style = "box-sizing: border-box; width: 120px; cursor: default; position: absolute; padding: 10px; top: 30px; left: 0px; border: 1px solid gray; border-radius: 5px; background-color: #e2e2e2;"
    fontSelectUI.style.display = 'none'; // 初始设置为不可见

    const closeButton = this.document.createElement('button');
    closeButton.style = "width: 100px; height: 25px; cursor: pointer"
    closeButton.textContent = '关闭';

    closeButton.onclick = function() {
        fontSelectUI.style.display = 'none';
        console.log(document.getElementById("FontSelectUI"))
    };

    const fontSelector = document.createElement('select');
    fontSelector.innerHTML = `<option value="">默认字体</option>
                               <option value="KaiTi">楷体</option>
                               <option value="Microsoft JhengHei">微软正黑体</option>
                               <option value="YouYuan">幼圆</option>
                               <option value="STXihei">华文细黑</option>
                               <option value="STZhongsong">华文中宋</option>
                               <option value="STXinwei">华文新魏</option>
                               <option value="STXingkai">华文行楷</option>
                               <option value="MiSans">MiSans</option>
                               <option value="PingFang SC">苹方(macOS)</option>`;
    fontSelector.style = "z-index: 10000; position: relative; width: 100px; height: 25px; margin-bottom: 5px;"
    document.body.appendChild(fontSelector);

    const toggleDiv = document.createElement('div');
    toggleDiv.style = "width: 120px; position: fixed; top: 10px; left: 50%; z-index: 10001;"
    // 创建一个可拖动的按钮来控制fontSelector的显示
    const toggleButton = document.createElement('button');
    toggleButton.style = "width: 120px; height: 25px; position: relative; border-radius: 5px; border: 1px solid gray; background-color: #e2e2e2; cursor: pointer;"
    toggleButton.textContent = '修改字体';

    let bCanDrop = true;

    // 切换fontSelector显示的功能
    toggleButton.onclick = function() {
        if (bCanDrop) {
            fontSelectUI.style.display = 'block';
        }
    };

    // 添加拖动功能到toggleDiv
    toggleDiv.onmousedown = function(event) {
        let shiftX = event.clientX - toggleDiv.getBoundingClientRect().left;
        let shiftY = event.clientY - toggleDiv.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            toggleDiv.style.left = pageX - shiftX + 'px';
            toggleDiv.style.top = pageY - shiftY + 'px';
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        toggleDiv.onmouseup = function() {
            document.removeEventListener('mousemove', onMouseMove);
            toggleDiv.onmouseup = null;
        };
    };

    toggleDiv.ondragstart = function() {
        return false;
    };

    document.body.append(toggleDiv);
    toggleDiv.append(toggleButton, fontSelectUI);
    fontSelectUI.append(fontSelector, closeButton);

    // 从localStorage中加载保存的字体设置
    const savedFont = localStorage.getItem('selectedFont');
    if (savedFont) {
        fontSelector.value = savedFont;
        updateSubtitleFont(savedFont);
    }

    // 字体选择事件监听器
    fontSelector.addEventListener('change', function() {
        const selectedFont = this.value;
        toggleButton.style.fontFamily = selectedFont;
        fontSelector.style.fontFamily = selectedFont;
        closeButton.style.fontFamily = selectedFont;
        localStorage.setItem('selectedFont', selectedFont); // 保存用户选择到localStorage
        updateSubtitleFont(selectedFont);
    });

    // 更新字幕字体的函数
    function updateSubtitleFont(font) {
        const subtitles = document.querySelectorAll('.bpx-player-subtitle-panel-text');
        subtitles.forEach(subtitle => {
            subtitle.style.fontFamily = font;
        });
    }

    // 监听DOM变更以自动应用字体样式变更
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
                updateSubtitleFont(fontSelector.value);
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();