const SecondsToStay = 50; //stay load
const SecondsToStart = 10; //seconds to download before start

const player = document.getElementById('player');
const mimeCodec = 'video/mp4; codecs="mp4a.40.2, avc1.64001F"'
const mediaSource = new MediaSource();

console.log(src)
player.src = URL.createObjectURL(mediaSource);


var MaxByteLoad;
var currentPice = 0
var sourceBuffer;
var isProcessing = false;

mediaSource.addEventListener('sourceopen', function() {
    URL.revokeObjectURL(player.src);
    Start()
});


async function InsertIntoMediaFile(buffer, from){
    await new Promise(async (resolve, reject) => {
        try{
            if(isProcessing == false){
                isProcessing = true
                await sourceBuffer.appendBuffer(buffer);
                await sourceBuffer.addEventListener('updateend', function() {
                    isProcessing = false
                    resolve(true);
                });
            }
        }catch(e){console.log('oops'); console.log(from, ' > this req breakup everthing.', e);resolve(true)}
    })
    
}

async function Load(){      //return Uint8Array
    let current = await getBuffer(currentPice);                    
            
    let datafromcurrent = current.data
    currentPice += current.data.byteLength
    let data = new Uint8Array(datafromcurrent);
    
    return data
}

async function Start(){
    sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
    sourceBuffer.mode = 'sequence';

    let current = await getBuffer(currentPice);                    
    let [currentByte, byterange] = current.length.split('-')
    let [currentByteRange, ToByteRange] = byterange.split('/')
    MaxByteLoad = ToByteRange;

    
    while(true){
        try{

            await MakeLoadInsert('start');
            var InBuffer = player.buffered.end(player.buffered.length -1)
            if(InBuffer >= SecondsToStart){
                break
            }
        }catch(e){console.log('e')}
    }
};

async function MakeLoadInsert(from){
    if(currentPice > MaxByteLoad){}else{
        if(currentPice != MaxByteLoad){
            let temp_buf = await Load()
            await InsertIntoMediaFile(temp_buf, from)
        }else{
            if(mediaSource.readyState == 'open'){
                mediaSource.endOfStream();
            }
        }
    }
}

/////////////////////////////////
//player state
////////////////////////////////////
player.addEventListener('seeking', async (e) => {
    try{
        var InBuffer = player.buffered.end(player.buffered.length -1)
        if(InBuffer < e.target.currentTime + SecondsToStay){
            while(true){
                    let tempbufval = player.buffered.end(player.buffered.length -1)
                    if(tempbufval < e.target.currentTime + SecondsToStay){
                        await MakeLoadInsert('seek');
                    }else{
                        break
                    }
            }
        }
    }catch(e){}
})

player.addEventListener('timeupdate', async (e) => {
    try{
        var InBuffer = player.buffered.end(player.buffered.length -1)
        if(e.target.currentTime >  InBuffer - SecondsToStay){
            for(let i=0;i<100;i++){
                let tempbufval = player.buffered.end(player.buffered.length -1)
                if(e.target.currentTime >  tempbufval - SecondsToStay){
                    await MakeLoadInsert('time');
                }else{
                    break
                }
            }
        }
    }catch(e){}
})


////////////////////////////////////////////
//fucntional code(nake req for stream server)///
//////////////////////////////////////////*/

//>make xmlhttprequest
async function getBuffer(from){
    let buffer = await new Promise(async (resolve, reject) => {     
        let xhr = new window.XMLHttpRequest();
        xhr.open('get', 'http://localhost:8000/video')
        xhr.responseType = 'arraybuffer';
        xhr.setRequestHeader('range', `bytes=${from}-`)
        xhr.setRequestHeader('Access', '*');
        
        xhr.send();
        xhr.onload = (e) => {
            let length = xhr.getResponseHeader("Content-Range")
            resolve({data: xhr.response, length: length})
        }
        
        xhr.onerror = (e) => {
            reject(e)
        }
    });
    return buffer
}
