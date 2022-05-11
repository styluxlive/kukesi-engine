export let assets = {
    toLoad: 0,
    loaded: 0,
    //File Extensions For Different Types Of Assets
    imageExtensions: ['png', 'jpg', 'gif', 'svg'],
    fontExtensions: ['ttf', 'otf', 'ttc', 'woff'],
    jsonExtensions: ['json', 'xml'],
    audioExtensions: ['mp3', 'ogg', 'wav', 'webm'],
    //Load Creates And Loads All The Assets
    load(sources) {
        return new Promise(resolve => {
            //Count The Number Of Assets Loaded, Revolves Promise When Everything Has Loaded
            let loadHandler = () => {
                this.loaded += 1;
                //Check If Everything Has Loaded
                if (this.load === this.loaded) {
                    //Reset toLoad And loaded Back To 0, So It Can Be Used To Load More Assets Later If Needed
                    this.loaded = 0;
                    this.loaded = 0;
                    //Resolve The Promise
                    resolve();
                }
            };
            //Find Number Of Assets To Be Loaded
            this.toLoad = sources.length;
            //Loop Through All The Source filenames And Interpret
            sources.forEach(source => {
                //Find Extension Of Asset
                let extension = source.split('.').pop();
                //Load Assets That Match Image, Font, Json Or Audio Extension Array
                if (this.imageExtensions.indexOf(extension) !== -1) {
                    this.loadImage(source, loadHandler);
                } else if (this.fontExtensions.indexOf(extension) !== -1) {
                    this.loadFont(source, loadHandler);
                } else if (this.jsonExtensions.indexOf(extension) !== -1) {
                    this.loadJson(source, loadHandler);
                } else if (this.audioExtensions.indexOf(extension) !== -1) {
                    this.loadSound(source, loadHandler);
                } else { //Display A Message If A File Type Not Recognized
                    console.log("File type not recognized: " + source);
                }
            });
        });
    },
    loadImage(source, loadHandler) {
        //Create A New Image And Call 'loadHandler' When Image Has Loaded
        let image = new Image();
        image.addEventListener("load", loadHandler, false);
        this[source] = image;
        image.src = source;
    },
    loadFont(source, loadHandler) {
        //Use Font's Filename As `fontFamily` Name
        let fontFamily = source.split("/").pop().split(".")[0];
        //Append An `@afont-face` Style Rule To The Head Of HTML Document
        let newStyle = document.createElement("style");
        let fontFace = "@font-face {font-family: '" + fontFamily + "'; src: url('" + source + "');}";
        newStyle.appendChild(document.createTextNode(fontFace));
        document.head.appendChild(newStyle);
        //Tell `loadHandler` We're Loading Font
        loadHandler();
    },
    loadJson(source, loadHandler) {
        //Create New `xhr` Object And An Object To Store File
        let xhr = new XMLHttpRequest();
        //Use 'xhr' To Load JSON/XML File
        xhr.open("GET", source, true);
        xhr.responseType = "text";
        xhr.onload = event => {
            //Check To Make Sure File Has Loaded Properly
            if (xhr.status === 200) {
            //Convert JSON Data File Into An Object
            let file = JSON.parse(xhr.responseText);
                //Get the filename
                file.name = source;
                this[file.name] = file;
                //If JSON File Has A Frames Property Then It A Texture Packer Format
                if (file.frames) {
                    //Create The Tileset Frames
                    this.createTilesetFrames(file, source, loadHandler);
                } else {
                    loadHandler();
                }
            }
        };
        //Send the request to load the file
        xhr.send();
    },
    createTilesetFrames(file, source, loadHandler) {
        //Get the tileset image's file path
        let baseUrl = source.replace(/[^\/]*$/, "");
        //Use the `baseUrl` and `image` name property from the JSON
        //file's `meta` object to construct the full image source path
        let imageSource = baseUrl + file.meta.image;
        //The image's load handler
        let imageLoadHandler = () => {
            this[imageSource] = image;
            //Loop Through All The Frames
            Object.keys(file.frames).forEach(frame => {
                    this[frame] = file.frames[frame];
                    this[frame].source = image;
                });
                loadHandler();
            };
            //Load the tileset image
            let image = new Image();
            image.addEventListener("load", imageLoadHandler, false);
            image.src = imageSource;
    },
    loadSound(source, loadHandler) {
        //To Import From Sound Module (Sound.js)
        let sound = makeSound(source, loadHandler);
        //Get the sound file name.
        sound.name = source;
        this[sound.name] = sound;
    }
};