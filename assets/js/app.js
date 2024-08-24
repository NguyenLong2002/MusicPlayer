const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAY_STORAGE_KEY = 'longlufy';

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('.progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist')

const app = {
    currenIndex:0,
    isPlaying : false,
    isRandom : false,
    isRepeat : false,
    config : JSON.parse(localStorage.getItem(PLAY_STORAGE_KEY)) || {},
    //cấu hình
    setConfig: function(key, value){
        this.config[key] = value;
        localStorage.setItem(PLAY_STORAGE_KEY, JSON.stringify(this.config))
    },
    songs: [
        {
            name:'Một người vì em',
            singer: 'WEAN',
            path:'./assets/songs/song1.mp3',
            image:'./assets/imgs/imgSong1.jpg'
        },
        {
            name:'Love U So',
            singer: 'WEAN',
            path:'./assets/songs/song2.mp3',
            image:'./assets/imgs/imgSong2.jpg'
        },
        {
            name:'RETROGRADE ',
            singer: 'WEAN',
            path:'./assets/songs/song3.mp3',
            image:'./assets/imgs/imgSong3.jpg'
        },
        {
            name:'badbye',
            singer: 'WEAN',
            path:'./assets/songs/song4.mp3',
            image:'./assets/imgs/imgSong4.jpg'
        },
        {
            name:'Đợi',
            singer: 'WEAN',
            path:'./assets/songs/song5.mp3',
            image:'./assets/imgs/imgSong5.jpg'
        },
        {
            name:'shhhhhhh..',
            singer: 'WEAN',
            path:'./assets/songs/song6.mp3',
            image:'./assets/imgs/imgSong6.jpg'
        }
    ],
    defineProperties:function(){
        Object.defineProperty(this,'currentSong',{
            get: function(){
                return this.songs[this.currenIndex]
            }
        })
    },
    render:function(){
        const htmls = this.songs.map((song,index) => {
            return `
                <div class="song ${index === this.currenIndex ? 'active' : ''}" data-index = "${index}" >
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fa-solid fa-ellipsis"></i>
                    </div>
                </div>      
            `
        })
        playlist.innerHTML = htmls.join('')

    },

    handleEvent:function(){
        const _this = this;
        const cdWidth = cd.offsetWidth;

        //Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg'}
        ],{
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause();

        //Xử lý phong to / thu nhỏ CD
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        //Xử lý khi click play
        playBtn.onclick = function(){
            if(_this.isPlaying){
                audio.pause();
            }else{
                audio.play();
            }
        }

        //Khi song bị pause
        audio.onpause = function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause()
        }
        //Khi song được play
        audio.onplay = function(){
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                if(audio.currentTime){
                    progress.value = progressPercent;
                    progress.style.backgroundImage = `linear-gradient(90deg, #ec1f55 ${progressPercent}%, transparent 0%)`
                }
            }
            
        }
        //Khi tua bài hát
        progress.oninput = function(e){
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }
        //Khi prev bài hát
        prevBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong();
            }else{
                _this.prevSong()
            }
            audio.play();
            _this.render();
        }
        //Khi next bài hát
        nextBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong();
            }else{
                _this.nextSong()
            }
            audio.play();
            _this.render();
        }
        // Phát lại bài hát
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat',_this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat)

        }
        //Xử lý bật / tắt rondom
        randomBtn.onclick = function(){
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom',_this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom)
        }
        //Xử lý next khi kết thúc bài hát
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play()
            }else{
                nextBtn.click();
            }
            
        }
        //Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)');

            if(songNode || e.target.closest('.option')){
                //Xử lý khi click vào song
                if(songNode){
                    _this.currenIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                //Xử lý khi click vào option
                if(e.target.closest('.option')){

                }
            }
        }
    },

    loadCurrentSong:function(){
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path;

    },

    loadConfig : function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    setupToConfig: function() {
        if(this.isRandom) {
            randomBtn.classList.add('active');         
        } 
        if(this.isRepeat) {
            repeatBtn.classList.add('active');
        }
    },
    prevSong:function(){
        this.currenIndex--;
        if(this.currenIndex < 0){
            this.currenIndex = this.songs.length-1;
        }
        this.loadCurrentSong();
    },
    nextSong:function(){
        this.currenIndex ++;
        if(this.currenIndex > this.songs.length-1){
            this.currenIndex = 0;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function(){
        let newIndex;
        do{
            newIndex = Math.floor(Math.random() * this.songs.length)
        }while (newIndex === this.currenIndex)
        
        this.currenIndex = newIndex;
        this.loadCurrentSong();
    },

    start:function(){
        //Gán cấu hình từ config vào ứng dụng
        this.loadConfig();
        this.setupToConfig();

        //Định nghĩa các thuộc tính cho object
        this.defineProperties();

        //Lắng nghe các sự kiện
        this.handleEvent()

        //Tải thông tin bài hát đâu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        //Render playlist
        this.render();

    }
}
app.start();