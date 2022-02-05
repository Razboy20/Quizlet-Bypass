// Copyright 2021-2022 rospino74
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import deleteQuizletAccount from './import/accountDeleter';
import makeQuizletAccount from './import/accountMaker';

const consolePrefixStyles = [
    'color: #fff',
    'background-color: #4255ff',
    'padding: 4px 6px',
    'border-radius: 5px',
].join(';');

const consoleBigStyles = [
    'color: #4255ff',
    'font-size: xx-large',
].join(';');

console.log('%cQuizlet%c v%s', consolePrefixStyles, 'color: gray; font-style: italic;', process.env.VERSION);

// aspetto 1.5 secondi prima di iniziare
setTimeout(() => {
    // Finding paywall banners
    const banner = document.querySelector('.BannerWrapper');
    const lockIcon = document.querySelector('img[data-testid="premiumBrandingBadge-lock"]');
    const notLoggedInPaywall = document.querySelector('.t15hde6e');
    const upgradePlanButtons = document.querySelectorAll('.AssemblyPrimaryButton--upgrade');

    if (notLoggedInPaywall) {
        // Cancello i bottoni social per il login
        notLoggedInPaywall.parentElement.removeChild(
            notLoggedInPaywall.parentElement.querySelector('.lfyx4xv'),
        );

        // Aggiorno lo stile
        document.querySelector('.t15hde6e').style.maxWidth = 'unset';
        notLoggedInPaywall.parentElement.style.backgroundColor = '#df1326';
        notLoggedInPaywall.parentElement.style.backgroundImage = 'none';

        // Cambio il testo nel paywall
        const bigTitle = notLoggedInPaywall.querySelector('.t1qexa4p');
        const smallTitle = notLoggedInPaywall.querySelector('.ssg8684');

        // Se lingua del browser è l'Italiano cambio il testo
        bigTitle.innerText = chrome.i18n.getMessage('lockedContent');
        smallTitle.innerHtml = chrome.i18n.getMessage('pressToReload', [
            '<a href="#" onclick="window.location.reload();">',
            '</a>',
        ]);
    }

    // Verifico che il banner esista e che non abbia un figlio
    // con la classe "WithAccent"
    if (/* !Quizlet.LOGGED_IN || */ !banner || !banner.querySelector('.WithAccent')) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(
                '%c%s',
                consoleBigStyles,
                chrome.i18n.getMessage('debugExpiredSolutions'),
            );
        }

        // Cancello l'account corrente
        deleteQuizletAccount();

        // Rinnovo l'account
        makeQuizletAccount();

        // Copio i cookies
        chrome.runtime.sendMessage({
            // tab: chrome.tabs.getCurrent(),
            action: 'copyCookies',
            value: document.cookie,
        });

        // Ricarico la pagina
        // chrome.runtime.sendMessage({
        //     tab: chrome.tabs.getCurrent(),
        //     action: 'refresh',
        // });

        // Warning about remaining solutions
    } else if (banner.querySelector('.WithAccent') && process.env.NODE_ENV !== 'production') {
        const debugRemainingSolutions = banner.querySelector('.WithAccent').innerText;
        console.log(
            '%cQuizlet%c %s %c%s',
            consolePrefixStyles,
            'color: white;',
            chrome.i18n.getMessage('debugRemainingSolutions'),
            'color: orange; font-weight: bold;',
            debugRemainingSolutions,
        );
    }

    // Removing the paywall from the DO
    if (banner) {
        banner.parentElement.remove();
    }

    if (lockIcon) {
        lockIcon.remove();
    }

    upgradePlanButtons.forEach((button) => button.remove());
}, 1500);
