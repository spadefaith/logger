
  const socket = io();
  socket.on('connected', (message)=>{
    console.log(message);

  })

let _cached = [];
let db = new PouchDB('log');
let started = false;
let content = document.getElementById('content');
let clearBtn = document.getElementById('clear-btn');
let isReady = Promise.resolve();
let index = 0;

socket.on('insert', (e)=>{
    // console.log(e);
    _cache(e);
    if (!started){
        _walk();
        started = true;
    }
});


function _insertToPouch(obj){
    let o = {};
    o._id = String(new Date().getTime()+index);
    o.data = obj;

    index += 1;
    return isReady.then(()=>{
        return db.put(o).then(()=>{
            return o;
        });
    })
}


function _cache(data){
    _cached.push(data);
    return _cached;
};


function _walk(){
    //remove the first element;
    let first = _cached[0];
    // console.log(first);
    if (first != undefined){
        // console.log(first);
        return _insertToPouch(first).then((result)=>{
            // console.log(result);
            _display(result);
        }).then(()=>{
            _cached = _cached.slice(1);
            _walk();
        });
    }
};

function _display(d){
    let li = document.createElement('li');
    li.id = d._id;
    li.textContent = JSON.stringify(d.data);

    let clear = content.children.namedItem('clear');
    // console.log(clear);
    clear && clear.remove()
    

    content.appendChild(li);
};

function _displayAll(result){
    if (!result.length) { return ;}
    let temp = "";
    for (let a = 0; a < result.length; a++){
        let data = result[a];
        let t = `<li id='${data._id}'>${JSON.stringify(data.data)}</li>`
        temp += t;
    };
    content.innerHTML = temp;
}

function _getAll(){
    return db.allDocs({include_docs:true}).then(result=>{
        console.info('restructuring data');
        return result.rows.map(item=>{
            return item.doc;
        });
    });
};

function _reset(){
    content.innerHTML = `<li name=clear>no log...</li>`
}


let walk = setInterval(()=>{
    _walk();
}, 500);


window.addEventListener('load', (e)=>{
    console.info('loading data');
    isReady.then(()=>{
        _getAll().then(result=>{
            console.log('creating template')
            
            _displayAll(result);
        })
    })
});

clearBtn.addEventListener('click', (e)=>{
    console.info('db is destroying')
    isReady = db.destroy().then(()=>{
        console.info('db is creating')
        db = new PouchDB('log');
        return db.info().then(()=>{
            console.info('resetting content')
            _reset();
        });
    })
});