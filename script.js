// UserScript for Indicwiki Transliteration

// By installing this User Script, you agree to the terms of use of the API service for Transliteration, deployed on Toolforge.
// Only the "page content" is sent to the API service for transliteration.
// Documentation: [[User:Agamyasamuel/Indicwiki-Transliterate.js]]
// Source: [[User:Agamyasamuel/Indicwiki-Transliterate.js]]
// License: MIT License

(function () {
    'use strict';

    // Wait for the page to load
    $(document).ready(function () {
        // Create list item container
        var li = document.createElement('li');
        li.className = 'vector-tab-noicon mw-list-item';
        li.style.position = 'relative';

        // Create link element
        var link = document.createElement('a');
        link.href = '#';
        link.className = 'new';

        // Create span for the text
        var span = document.createElement('span');
        span.textContent = 'Indicwiki Transliteration';
        link.appendChild(span);

        // Create dropdown content
        var dropdownContent = document.createElement('div');
        dropdownContent.style.display = 'none';
        dropdownContent.style.position = 'absolute';
        dropdownContent.style.backgroundColor = '#f9f9f9';
        dropdownContent.style.minWidth = '240px'; // Increased width for longer text
        dropdownContent.style.boxShadow = '0px 8px 16px 0px rgba(0,0,0,0.2)';
        dropdownContent.style.zIndex = '100';
        dropdownContent.style.border = '1px solid #ddd';
        dropdownContent.style.top = '2.5em';
        dropdownContent.style.left = '0';
        dropdownContent.style.borderRadius = '2px';

        // Create dropdown options
        var dropdownOptions = [
            {
                route: '/transliterate/AutoDetectPersioArabicScript',
                description: 'Auto-detect Persian-Arabic Script'
            },
            {
                route: '/transliterate/AutoDetectSindhiHindiScript',
                description: 'Auto-detect Sindhi-Hindi Script'
            },
            {
                route: '/transliterate/GurmukhiToShahmukhi',
                description: 'Gurmukhi to Shahmukhi'
            },
            {
                route: '/transliterate/HindiToUrdu',
                description: 'Hindi to Urdu'
            },
            {
                route: '/transliterate/ShahmukhiToGurmukhi',
                description: 'Shahmukhi to Gurmukhi'
            },
            {
                route: '/transliterate/SindhiDEVToRoman',
                description: 'Sindhi Devnagari to Roman'
            },
            {
                route: '/transliterate/SindhiDEVToSindhiUR',
                description: 'Sindhi Devnagari to Sindhi Urdu'
            },
            {
                route: '/transliterate/SindhiURToSindhiDEV',
                description: 'Sindhi Urdu to Sindhi Devnagari'
            },
            {
                route: '/transliterate/UrduToHindi',
                description: 'Urdu to Hindi'
            }
        ];

        // Language configurations for each transliteration route
        const languageConfigs = {
            '/transliterate/GurmukhiToShahmukhi': {
                sourceLanguage: 'pa',  // Punjabi (Gurmukhi)
                targetLanguage: 'ur',  // Urdu (for Shahmukhi)
                sourceName: 'Gurmukhi',
                targetName: 'Shahmukhi'
            },
            '/transliterate/HindiToUrdu': {
                sourceLanguage: 'hi',  // Hindi
                targetLanguage: 'ur',  // Urdu
                sourceName: 'Hindi',
                targetName: 'Urdu'
            },
            '/transliterate/ShahmukhiToGurmukhi': {
                sourceLanguage: 'ur',  // Urdu (for Shahmukhi)
                targetLanguage: 'pa',  // Punjabi (Gurmukhi)
                sourceName: 'Shahmukhi',
                targetName: 'Gurmukhi'
            },
            '/transliterate/SindhiDEVToRoman': {
                sourceLanguage: 'sd-deva',  // Sindhi Devanagari
                targetLanguage: 'en',  // Roman (English)
                sourceName: 'Sindhi Devanagari',
                targetName: 'Roman'
            },
            '/transliterate/SindhiDEVToSindhiUR': {
                sourceLanguage: 'sd-deva',  // Sindhi Devanagari
                targetLanguage: 'sd',  // Sindhi
                sourceName: 'Sindhi Devanagari',
                targetName: 'Sindhi Urdu'
            },
            '/transliterate/SindhiURToSindhiDEV': {
                sourceLanguage: 'sd',  // Sindhi
                targetLanguage: 'sd-deva',  // Sindhi Devanagari
                sourceName: 'Sindhi Urdu',
                targetName: 'Sindhi Devanagari'
            },
            '/transliterate/UrduToHindi': {
                sourceLanguage: 'ur',  // Urdu
                targetLanguage: 'hi',  // Hindi
                sourceName: 'Urdu',
                targetName: 'Hindi'
            }
        };

        // Create and style the dropdown options container
        dropdownOptions.forEach(function (option) {
            var item = document.createElement('a');
            item.href = '#';
            item.textContent = option.description;
            item.style.display = 'block';
            item.style.padding = '8px 12px';
            item.style.textDecoration = 'none';
            item.style.color = '#202122';
            item.style.cursor = 'pointer';
            item.style.fontSize = '13px';
            item.style.whiteSpace = 'nowrap';

            // Add hover effect
            item.addEventListener('mouseover', function () {
                this.style.backgroundColor = '#eaecf0';
                this.style.borderColor = 'rgba(0, 0, 0, 0)';
            });
            item.addEventListener('mouseout', function () {
                this.style.backgroundColor = 'transparent';
            });

            // Add click handler
            item.addEventListener('click', async function (e) {
                e.preventDefault();

                const config = languageConfigs[option.route];
                if (!config) {
                    mw.notify('Unsupported transliteration option', { type: 'error' });
                    return;
                }

                // Get the content language
                const contentLang = mw.config.get('wgPageContentLanguage');

                // Check if content is in the correct source language
                if (contentLang !== config.sourceLanguage) {
                    mw.notify(`This page is not in ${config.sourceName} language. Transliteration is only available for ${config.sourceName} content.`, { type: 'warning' });
                    return;
                }

                // Get the page title
                const pageTitle = mw.config.get('wgPageName');

                try {
                    // First, fetch the wikitext from source Wikipedia API
                    const wikiApiUrl = `https://${contentLang}.wikipedia.org/w/api.php?action=parse&format=json&page=${encodeURIComponent(pageTitle)}&prop=wikitext&formatversion=2&origin=*`;

                    const wikiResponse = await fetch(wikiApiUrl);
                    if (!wikiResponse.ok) {
                        throw new Error(`Failed to fetch wikitext from ${config.sourceName} Wikipedia`);
                    }

                    const wikiData = await wikiResponse.json();
                    if (!wikiData.parse || !wikiData.parse.wikitext) {
                        throw new Error(`Invalid response from ${config.sourceName} Wikipedia API`);
                    }

                    const wikitext = wikiData.parse.wikitext;

                    // Transliterate the page title
                    const titleResponse = await fetch(`http://127.0.0.1:8000${option.route}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ text: pageTitle })
                    });


                    if (!titleResponse.ok) {
                        throw new Error('Title transliteration failed');
                    }

                    const titleResult = await titleResponse.json();
                    console.log("Title Result:", titleResult.result);

                    // Update the page title
                    const pageTitleElement = document.querySelector('.mw-page-title-main');
                    if (pageTitleElement) {
                        pageTitleElement.textContent = titleResult.result || 'Unknown';
                    }

                    // Send the wikitext to transliteration API
                    const translitResponse = await fetch(`http://127.0.0.1:8000${option.route}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ text: wikitext })
                    });

                    if (!translitResponse.ok) {
                        const errorText = await translitResponse.text();
                        console.error('Transliteration API Error:', errorText);
                        throw new Error('Transliteration failed: ' + errorText);
                    }

                    const translitResult = await translitResponse.json();
                    console.log("Transliteration Response:", translitResult.result);

                    // Decode Unicode escape sequences if needed
                    let transliteratedText = translitResult.result;
                    if (typeof transliteratedText === 'string') {
                        try {
                            // Decode Unicode escape sequences
                            transliteratedText = JSON.parse(`"${transliteratedText.replace(/"/g, '\\"')}"`);
                        } catch (e) {
                            console.warn('Failed to decode Unicode escape sequences:', e);
                        }
                    }

                    // Convert transliterated wikitext to HTML using source Wikipedia API
                    const parseApiUrl = `https://${contentLang}.wikipedia.org/w/api.php`;
                    const parseResponse = await fetch(parseApiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: `action=parse&format=json&text=${encodeURIComponent(transliteratedText)}&contentmodel=wikitext&prop=text&formatversion=2&origin=*`
                    });

                    if (!parseResponse.ok) {
                        throw new Error('Failed to parse transliterated wikitext');
                    }

                    const parseData = await parseResponse.json();
                    if (!parseData.parse || !parseData.parse.text) {
                        throw new Error('Invalid response from parse API');
                    }

                    // Update the page content with the parsed HTML
                    const contentDiv = document.querySelector('.mw-parser-output');
                    if (contentDiv) {
                        contentDiv.innerHTML = parseData.parse.text;

                        // Re-run any scripts that might be in the content
                        const scripts = contentDiv.getElementsByTagName('script');
                        for (let script of scripts) {
                            eval(script.textContent);
                        }

                        mw.notify(`Content has been transliterated from ${config.sourceName} to ${config.targetName}`, { type: 'success' });
                    } else {
                        throw new Error('Could not find content container');
                    }

                } catch (error) {
                    console.error('Error:', error);
                    mw.notify(`Error: ${error.message}`, { type: 'error' });
                }

                // Close dropdown
                dropdownContent.style.display = 'none';
            });

            dropdownContent.appendChild(item);
        });

        // Add click event to toggle dropdown
        link.addEventListener('click', function (e) {
            e.preventDefault();
            // Close all other dropdowns first
            var allDropdowns = document.querySelectorAll('.vector-tab-noicon .dropdown-content');
            allDropdowns.forEach(function (dropdown) {
                if (dropdown !== dropdownContent) {
                    dropdown.style.display = 'none';
                }
            });
            // Toggle this dropdown
            dropdownContent.style.display = dropdownContent.style.display === 'none' ? 'block' : 'none';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (event) {
            if (!li.contains(event.target)) {
                dropdownContent.style.display = 'none';
            }
        });

        // Add elements to list item
        li.appendChild(link);
        li.appendChild(dropdownContent);

        // Find the Talk tab and insert our dropdown after it
        var talkTab = document.querySelector('#ca-talk');
        if (talkTab) {
            talkTab.parentNode.insertBefore(li, talkTab.nextSibling);
        }
    });
})();
