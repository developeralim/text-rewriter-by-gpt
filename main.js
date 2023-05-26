const rw_config = {
    contentType : "application/json",
    apiKey      : "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",
    model       : "gpt-3.5-turbo",
    role        : "user",
    command     : "write the same text but different way",
    apiEndpoint : "https://api.openai.com/v1/chat/completions",
    buttonText  : "rewrite"
}

const events = [
    'keyup',
    'keydown',
    'mouseup',
    'mousedown',
    'click',
    'dbclick',
    'change',
];

//render the button when window load
window.addEventListener('load',function(){
    const button        = this.document.createElement('button');
    button.textContent  = `${rw_config.buttonText}`
    button.classList.add('rewrite');
    this.document.body.appendChild(button);

    // call the root method
    root();
})

function root(){

    // select the buttton
    const button = document.querySelector('.rewrite');

    for (let i = 0; i < events.length; i++) {
        document.addEventListener(`${events[i]}`,function( e ){
            // check if target and button are the same object
        if (e.target == button) return;

            var selection       = window.getSelection();
            var selectedText    = selection.toString();
            var range           = selection.getRangeAt(0);
            console.log(selectedText);
            // if slected text is empty
            if (selectedText.length == 0 || selectedText == '' || ! selectedText.match(/[\w]/gi)) {
                button.style.display = "none";
                return;
            }
    
            /**
             * @var {String} lastWord word of selected 
             */
            var lastWord       = selectedText.split(' ').pop();
    
            //clone range
            var cloneRange     = range.cloneRange();
            cloneRange.setStart(cloneRange.endContainer, cloneRange.endOffset - lastWord.length);
            cloneRange.setEnd(cloneRange.endContainer, cloneRange.endOffset);
    
            //get last word postion
            const left      = cloneRange.getBoundingClientRect().left;
            const top       = cloneRange.getBoundingClientRect().top;
            const height    = cloneRange.getBoundingClientRect().height;
            const width     = cloneRange.getBoundingClientRect().width;
    
            // style for 
            button.style.display = "block";
            button.style.left    = left + width + 'px';
            button.style.top     = top + height + 'px';
        })    
    }


    button.addEventListener('click', async function () {

        // get selection and selected text
        var selection     = window.getSelection();
        var selectedText  = selection.toString();

        const selfText    = this.innerText;
        this.classList.add('loading');

        // send api request to chat gpt to get response
        let response = await getGPTResponse(selectedText);
        try {
            response = JSON.parse(response);
            if (! response.hasOwnProperty('error') ) {

                const text          = response.choices[0].message.content;
                var range           = selection.getRangeAt(0);
                var replacementNode = document.createTextNode(text);
                range.deleteContents();
                range.insertNode(replacementNode);

            }

            this.style.display  = 'none';
            this.innerText      = selfText;
            selection.removeAllRanges();
            this.classList.remove('loading');

            if (response.hasOwnProperty('error')) {
                throw response.error.message;
            }

        } catch (error) {
            alert(error);
        }

    });
}


/**
 * 
 * @param {String} text what is to be sent to chat gpt in order to rewrite
 * @returns 
 */
function getGPTResponse(text) {
    return new Promise((resolve, reject) => {
        var myHeaders = new Headers();

        // set authorization header
        myHeaders.append("Content-Type",rw_config.contentType);
        myHeaders.append("Authorization", `Bearer ${rw_config.apiKey}`);

        var raw = JSON.stringify({
            "model": `${rw_config.model}`,
            "messages": [
                {
                    "role": `${rw_config.role}`,
                    "content": `'${text}' ${rw_config.command}`
                }
            ]
        });

        fetch(`${rw_config.apiEndpoint}`,{
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        })
        .then(response => response.text())
        .then(result => resolve(result))
        .catch(error => reject(error));
    });

}
