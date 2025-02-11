// Copyright 2021-2022 rospino74 and contributors
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

function firefoxListener(details: chrome.webRequest.WebRequestBodyDetails) {
    // @ts-ignore
    const filter = browser.webRequest.filterResponseData(details.requestId);
    const decoder = new TextDecoder('utf-8');
    const encoder = new TextEncoder();

    filter.ondata = (event: any) => {
        let str = decoder.decode(event.data, { stream: true });

        str = parseAndRemove(str);

        if (process.env.NODE_ENV !== 'production') {
            console.log(`Modified HTML:\n${str}`)
        }

        filter.write(encoder.encode(str));
        filter.disconnect();
    }

    return {};
}
function parseAndRemove(str: string): string {
    // Getting the only the div with one of his many classes __isAdBlockerEnabled
    const div = str.match(/<div class="[^>"]*__isAdBlockerEnabled[^>]*>([\s\S]*?)<\/div>/g)![0];

    const template = document.createElement('template');
    template.innerHTML = div;

    const adblockerFishingHook = template.content.querySelector<HTMLDivElement>('.__isAdBlockerEnabled');
    adblockerFishingHook!.className = "__isAdBlockerEnabled";

    // Updating the HTML
    return str.replace(div, template.innerHTML);
}

export default function installQuizletInterceptor() {
    try {
        // @ts-ignore
        if (typeof browser !== 'undefined') {
            // @ts-ignore
            browser.webRequest.onBeforeRequest.addListener(
                firefoxListener,
                { urls: ['https://quizlet.com/explanations/textbook-solutions/*'] },
                ['blocking']
            );
            if (process.env.NODE_ENV !== 'production') {
                if (/^it\b/.test(navigator.language)) {
                    console.log("%cSistema anti-anti-copiatura installato. %cL'anti-copy evader è supportato pienamente solo su Firefox, per info: https://bugs.chromium.org/p/chromium/issues/detail?id=104058", 'color: #80f5ab;', 'color: gray; font-style: italic;');
                } else {
                    console.log("%cThe anti-anti-copy system has been installed. %cThe anti-copy evader is fully supported on Firefox only, for info: https://bugs.chromium.org/p/chromium/issues/detail?id=104058", 'color: #80f5ab;', 'color: gray; font-style: italic;');
                }
            }
        } else {
            throw Error('Chromium Browsers not supported');
        }
    } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
            if (/^it\b/.test(navigator.language)) {
                console.log("%cImpossibile intercettare le risposte. Il sistema anti anti copiatura è pienamente supportato solo Firefox. %cL'anti-copy evader non sarà disponibile.\n\n%cPer info: %chttps://bugs.chromium.org/p/chromium/issues/detail?id=104058", 'color: #f04747;', 'color: gray; font-style: italic;', 'color: #009dd9;', 'color: gray; font-style: italic;');
            } else {
                console.log("%cUnable to intercept solutions. The anti-anti-copy system is fully supported only Firefox. %cThe anti-copy evader will not be available.\n\n%cFor info: %chttps://bugs.chromium.org/p/chromium/issues/detail?id=104058", 'color: #f04747;', 'color: gray; font-style: italic;', 'color: #009dd9;', 'color: gray; font-style: italic;');
            }
            console.error(e);
        }
    }
}
