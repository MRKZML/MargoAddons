// ==UserScript==
// @name         MargoEmoty
// @namespace    http://tampermonkey.net/
// @version      0.7.1
// @description  Podmienia emotikony w czacie Margonem na GIFy, zachowując poprawny HTML i historię wiadomości.
// @author       MRK (Markenzo)
// @match        https://*.margonem.pl/
// @exclude      https://www.margonem.pl/
// @match        https://*.margonem.com/
// @exclude      https://www.margonem.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=margonem.pl
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/MRKZML/MargoAddons/refs/heads/main/NowyInterfejs/MargoEmoty.js
// @updateURL    https://raw.githubusercontent.com/MRKZML/MargoAddons/refs/heads/main/NowyInterfejs/MargoEmoty.js
// ==/UserScript==

(function() {
    'use strict';

    const arrEmotes = [
        [':)', 'smile'], [';)', 'wink'], [':P', '8p'], [':p', '8p'], [';P', 'razz'], [';p', 'razz'],
        ['xd', 'xd'], ['xD', 'xd'], ['Xd', 'xd'], ['XD', 'xd'], [':ahh', 'aww'], ['ahh', 'aww'],
        [';)))', 'lol'], [':)))', 'lol'], [';D', 'biggrin'], [':D', 'biggrin'], [';d', 'biggrin'], [':d', 'biggrin'],
        [';]', 'smirk'], [':]', 'smirk'], [';wstydnis', 'blush'], [':wstydnis', 'blush'], ['x|', 'doh'], ['X|', 'doh'],
        ['X(', 'mad'], ['x(', 'mad'], [':(', 'sad'], [':oops', 'oops'], [':|', 'eek'], [';|', 'eek'],
        [';(', 'crying'], [';*', 'kiss'], [':*', 'kiss'], [';>', 'evileye'], [':>', 'evileye'],
        [':thx', 'thanks'], ['thx', 'thanks'], [';o', 'o_o'], [':o', 'o_o'], [';O', 'o_o'], [':O', 'o_o'],
        [']:->', 'evillaugh'], ['];->', 'evillaugh'], [':tanczy', 'boogie'], [':zombie', 'zombie'],
        [':rotfl', 'rotfl'], [':/', 'upset'], [';/', 'upset'], [':\\', 'hmm'], [';\\', 'hmm']
    ];

    function EscapeRegExp(szText) {
        return szText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function ReplaceEmoticons(elSpan) {
        if (!elSpan) return;

        let szHTML = elSpan.innerHTML;

        arrEmotes.forEach(([szKey, szImg]) => {
            const objRegex = new RegExp(`(?<!<[^>]*)(?<=^|\\s)${EscapeRegExp(szKey)}(?=$|\\s)(?![^<]*>)`, 'g');
            szHTML = szHTML.replace(objRegex, `<img src="https://micc.garmory-cdn.cloud/obrazki/emots/${szImg}.gif" style="height: 13px;">`);
        });

        elSpan.innerHTML = szHTML;
    }

    function ParseMessageElement(elMsg) {
        const szTime = elMsg.querySelector(".ts-section")?.innerText.trim() || "";
        const szChannel = elMsg.querySelector(".channel-section")?.innerText.trim().replace(/\[|\]/g, "") || "";
        const szAuthor = elMsg.querySelector(".author-section")?.innerText.trim().replace(/:$/, "") || "";
        const szReceiver = elMsg.querySelector(".receiver-section")?.innerText.trim().replace(/:$/, "") || "";
        const elContent = elMsg.querySelector(".message-section");

        ReplaceEmoticons(elContent);

        const szContent = elContent?.innerText.trim() || "";

        return { szTime, szChannel, szAuthor, szReceiver, szContent };
    }

    function ObserveNewMessages() {
        const elChatWrapper = document.querySelector(".chat-message-wrapper .scroll-pane");
        if (!elChatWrapper) {
            console.warn("[MargoEmoty] Nie znaleziono wrappera czatu do obserwacji");
            return;
        }

        const observer = new MutationObserver(arrMutations => {
            arrMutations.forEach(objMutation => {
                objMutation.addedNodes.forEach(elNode => {
                    if (elNode.nodeType === 1 && elNode.classList.contains("new-chat-message")) {
                        const objMsg = ParseMessageElement(elNode);
                        // console.log(`[NOWA WIADOMOŚĆ][${objMsg.szChannel}] ${objMsg.szAuthor} -> ${objMsg.szReceiver}: ${objMsg.szContent}`);
                    }
                });
            });
        });

        observer.observe(elChatWrapper, { childList: true, subtree: true });
        console.log("[MargoEmoty] Nasłuchiwanie wiadomości uruchomione");
    }

    window.addEventListener("load", () => {
        ObserveNewMessages();
        document.querySelectorAll('.message-section').forEach(ReplaceEmoticons);
    });
})();