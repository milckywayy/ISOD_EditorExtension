const observer = new MutationObserver((mutations) => {
    const toolbars = document.getElementsByClassName("mceToolbarRow3");
    if (toolbars.length > 0) {
        observer.disconnect(); 
        initializeToolbars(toolbars);
    }
});

observer.observe(document.body, { childList: true, subtree: true });

function initializeToolbars(toolbars) {
    for (let i = 0; i < toolbars.length; i++) {
        let toolbarRows = toolbars[i].getElementsByTagName("tr")[0];

        let newSeparatorCell = createCell();
        newSeparatorCell.appendChild(buildSeparator());

        let newButtonCell = createCell();
        newButtonCell.appendChild(buildButton());

        toolbarRows.appendChild(newSeparatorCell);
        toolbarRows.appendChild(newButtonCell);
    }
}

// Tracking injection

function createListener() {
    alert('Views tracking on');

    console.log("Views tracking on");

    const polishTitleInput = document.querySelector('input[name="polishTitle"]');

    function updateTrackers(iframes, title) {
        iframes.forEach((iframe) => {
            if (!title) {
                title = polishTitleInput.value || "NO_TITLE_FOUND";
            }

            handleInputChange(iframe, title); 
        });
    }

    const iframes = getContentBodies(); 
    updateTrackers(iframes, null);

    polishTitleInput.addEventListener('input', (event) => {
        const currentValue = event.target.value;
        updateTrackers(iframes, currentValue);
    });
}

function getContentBodies() {
    const iframeContainers = document.querySelectorAll('.mceIframeContainer');
    if (iframeContainers.length === 0) {
        return [];
    }

    const iframesContent = [];

    const iframes = Array.from(iframeContainers).flatMap(container =>
        Array.from(container.querySelectorAll('iframe'))
    );

    for (let i = 0; i < iframes.length; i++) {
        let iframeDocument;
        try {
            iframeDocument = iframes[i].contentDocument || iframes[i].contentWindow.document;

            if (iframeDocument) {
                iframesContent.push(iframeDocument.body);
            }
        } catch (error) {
        }
    }

    return iframesContent;
}

function handleInputChange(iframe, title) {
    const trackingScriptContent = `fetch(\`https://eeproxyvm.francecentral.cloudapp.azure.com:8080/track?title=\${encodeURIComponent('${title}')}\`)`;
    const scriptTags = iframe.getElementsByTagName('script');
    let trackingScriptFound = false;

    for (let i = 0; i < scriptTags.length; i++) {
        const script = scriptTags[i];
        const scriptText = script.textContent || script.innerText;

        if (scriptText.includes('fetch(`https://eeproxyvm.francecentral.cloudapp.azure.com:8080/track')) {
            // Script exists, replace title
            script.textContent = trackingScriptContent;
            trackingScriptFound = true;
            // console.log("Tracking script updated with new title.");
            break;
        }
    }

    if (!trackingScriptFound) {
        // Script not found, create a new one
        const newScript = document.createElement('script');
        newScript.type = 'text/javascript';
        newScript.textContent = trackingScriptContent;
        iframe.appendChild(newScript);
        // console.log("Tracking script added to the content.");
    }
}

function isAlreadyTracking(content, scriptContent = 'fetch(`https://eeproxyvm.francecentral.cloudapp.azure.com:8080/track?title=${encodeURIComponent(title)}`)') {
    const scriptTags = content.getElementsByTagName('script');

    for (let i = 0; i < scriptTags.length; i++) {
        const script = scriptTags[i];
        const scriptText = script.textContent || script.innerText;

        if (scriptText.includes(scriptContent)) {
            return true;
        }
    }

    return false;
}

// Button building

function createCell() {
    const newCell = document.createElement("td");
    newCell.style.position = "relative";

    return newCell;
}

function buildButton() {
    const newButton = document.createElement("a");

    newButton.setAttribute("role", "button");
    newButton.setAttribute("id", "trackButton");
    newButton.setAttribute("href", "javascript:;");
    newButton.setAttribute("class", "mceButton mceButtonEnabled");
    newButton.setAttribute("onmousedown", "return false;");
    newButton.setAttribute("title", "Dodaj licznik wyświetleń do komunikatu");
    newButton.setAttribute("tabindex", "-1");

    const iconSpan = document.createElement("img");
    iconSpan.setAttribute("class", "mceIcon");
    iconSpan.setAttribute("src", "https://i.imgur.com/ZgxW8KC.png");
    newButton.appendChild(iconSpan);

    newButton.addEventListener('click', createListener);

    return newButton;
}

function buildSeparator() {
    const newSeparator = document.createElement("span");

    newSeparator.setAttribute("class", "mceSeparator");
    newSeparator.setAttribute("role", "separator");
    newSeparator.setAttribute("aria-orientation", "vertical");
    newSeparator.setAttribute("tabindex", "-1");

    return newSeparator;
}
