<template>
  <div class="home">

    <div class="row">
      <searchbar class="col-sm-12 col-md-6 col-md-offset-3"></searchbar>
    </div>

    <div class="row">
      <div id="sortnfilter" class="col-md-offset-1 col-md-2">
  
        <div id="accordion">
          <div class="card">
            <div class="card-header" id="headingOne">
              <h5 class="mb-0">
                <button class="btn btn-secondary" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne" >
                  Filter by Genre
                </button>
              </h5>
            </div>
            <div id="collapseOne" class="collapse" aria-labelledby="headingOne" data-parent="#accordion"  aria-expanded="false">
              <div class="card-body">
                <li v-for="genre in movieGenre"><router-link :to="{ name: 'results', params: { param: genre }}">{{genre}}</router-link></li>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header" id="headingTwo">
              <h5 class="mb-0">
                <button class="btn btn-secondary collapsed" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                  Filter by Year
                </button>
              </h5>
            </div>
            <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordion"  aria-expanded="false">
              <div class="card-body">
                <li><router-link to="/search/1970">old - 1970</router-link></li>
                <li><router-link to="/search/1990">1970 - 1990</router-link></li>
                <li><router-link to="/search/2010">1990 - 2010</router-link></li>
                <li><router-link to="/search/now">2010 - new</router-link></li>
                
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header" id="headingThree">
              <h5 class="mb-0">
                <button class="btn btn-secondary collapsed" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                  Filter by Rating
                </button>
              </h5>
            </div>
            <div id="collapseThree" class="collapse" aria-labelledby="headingThree" data-parent="#accordion"  aria-expanded="false">
              <div class="card-body">
                <li><router-link to="/search/5">0 - 5</router-link></li>
                <li><router-link to="/search/7">6 - 7</router-link></li>
                <li><router-link to="/search/10">8 - 10</router-link></li>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-header" id="headingFour">
              <h5 class="mb-0">
                <button class="btn btn-secondary collapsed" data-toggle="collapse" data-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                  Filter by Title
                </button>
              </h5>
            </div>
            <div id="collapseFour" class="collapse" aria-labelledby="headingFour" data-parent="#accordion"  aria-expanded="false">
              <div class="card-body">
                <li><router-link :to="{ name: 'results', params: { param: 'A' }}"> A to Z </router-link></li>
                <li><router-link :to="{ name: 'results', params: { param: 'Z' }}"> Z to A </router-link></li>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header" id="headingFive">
              <h5 class="mb-0">
                <button class="btn btn-secondary collapsed" data-toggle="collapse" data-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
                  Sort By
                </button>
              </h5>
            </div>
            <div id="collapseFive" class="collapse" aria-labelledby="headingFive" data-parent="#accordion"  aria-expanded="false">
              <div class="card-body">
                <li @click="sortBy('title')">Title</li>
                <li @click="sortBy('genre')">Genre</li>
                <li @click="sortBy('oldest')">Oldest</li>
                <li @click="sortBy('newest')">Newest</li>
                <li @click="sortBy('rating')">Votes</li>
              </div>
            </div>
          </div>
        </div>
    </div>
      
    <div class="col-md-9">
    <div class="card col-md-3" style="min-height: 350px; border: 1px solid gainsboro; border-radius: 15px; padding-top: 20px; margin: auto 10px 10px auto;" v-for="lib in library">
      <img v-if="lib.poster" class="card-img-top" :src="lib.poster" width="40%" max-height="40%">
      <img v-else class="card-img-top" src="/static/img/video-icon.png" width="40%" alt="Card image cap">
      <hr>
      <div class="card-body">
        
        <h5 class="card-title" style="display: inline-block;">
          {{lib.title}}
          <span v-if="hasBeenSeen(lib.id) == true" class="glyphicon glyphicon-eye-open"></span>
        </h5>
        
        <div style="width:100%; max-height: 70px; overflow: hidden;">
        <p v-if="lib.description" class="card-text">{{lib.description}}</p>
        <p v-else class="card-text">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
        </div>
        <div>
          <button @click="setAndSend(lib.id, lib.token, lib.title, lib.download, lib.url)" class="btn btn-default glyphicon glyphicon-film" style="margin-bottom: 5px;"><span v-lang.watch></span></button>
        </div>
        <div>
          <span><span v-lang.year></span> {{lib.year}}</span>
          <span><span v-lang.rating></span> {{lib.rating}}</span>
        </div>
      </div>
    </div>
    </div>
    <infinite-loading @infinite="infiniteHandler">
      
      <span slot="no-more">
        <div class=" col-md-offset-3 col-md-7 alert alert-info" role="alert">
        <span v-lang.all_we_got></span>
        </div>
      </span>
      
    </infinite-loading>
  </div>
  </div>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading';
import Searchbar from '@/components/searchbar'
import {videoUrl} from '@/config.js'
import {userUrl} from '@/config.js'



export default{
  name: 'home',
  data(){
    return {
      allVideos: [],
      library : [],
      videoSeen: [],
      movieGenre: [],
      movieRating: [],
      page: 0
    }
  },
  created: function(){
    axios({
        method: 'get',
        url: videoUrl,
      })
      .then( (response) => {
        this.allVideos = response.data
        console.log(this.allVideos)
        this.setGenre(response.data)
      })
      .catch( (error) => {
        console.log(error)
      });

    axios({
        method: 'get',
        url: userUrl + localStorage.getItem('username') + '/performances',
      })
      .then( (response) => {
        for (let i = 0; i < response.data.length; i++){
          this.videoSeen[i] = response.data[i]['video_id']
        }
        localStorage.setItem('video-seen', this.videoSeen)
      })
      .catch( (error) => {
        console.log(error)
      });
  },
  components: {
    InfiniteLoading, Searchbar
  },
  methods: {
    infiniteHandler($state) {
      axios.get(videoUrl)
      .then(({ data }) => {
        if (data.length) {
          const temp = [];
          for (let i = this.page; i < this.page + 20; i++) {
            if (data[i]){
              temp.push(data[i]);
            }else {
              $state.complete();
            }
          }
          this.page = this.page + 20;
          this.library = this.library.concat(temp);
          $state.loaded();
          if (data.length / 20 === 10) {
            $state.complete();
          }
        } else {
          $state.complete();
        }
      });
    },
    setGenre: function(data){
      let tmp = []
      for (let i = 0; i < data.length; i++){
        let objGenre = JSON.parse(data[i].genre)
        for (let j = 0; j < objGenre.length; j++){
          if (this.movieGenre.length == '0'){
            this.movieGenre[0] = objGenre[0].trim().toLowerCase()
          }
          for (let k = 0; k < this.movieGenre.length; k++){
            if (objGenre[j].trim().toLowerCase() == this.movieGenre[k]){
              break;
            }
            if (objGenre[j].trim().toLowerCase() != this.movieGenre[k] && k == (this.movieGenre.length - 1)){
              tmp.push(objGenre[j].trim().toLowerCase())
            }
          }
          this.movieGenre = this.movieGenre.concat(tmp)
          tmp = []
        }
      }
      let alpha = []
      for (let i = 0; i < this.movieGenre.length; i++){
        if (this.movieGenre[i].match(/^[a-zA-Z]+$/))
          alpha.push(this.movieGenre[i])
      }
      this.movieGenre = alpha.sort()

    },
    hasBeenSeen: function(id){
      this.videoSeen = localStorage.getItem('video-seen')
      for (let i = 0; i < this.videoSeen.length; i++){
        if(this.videoSeen[i] == id)
          return true
      }
      return false
    },
    setAndSend: function(id, token, name, dl, link){
      if (dl == "0"){
        localStorage.setItem('video-name', name)
        localStorage.setItem('video-link', link)
        localStorage.setItem('video-magnet', link)
        localStorage.setItem('video-db', false)
        this.$router.push('/video/' + name)
      }
      else{
        let link = "/video/" + token
        localStorage.setItem('video-id', id)
        localStorage.setItem('video-token', token)
        localStorage.setItem('video-db', true)
        localStorage.setItem('video-name', name)
        this.$router.push(link)
      }
    },
    sortBy: function(item){
      let all = this.allVideos
      if (item == "title"){
       all.sort(function(a, b) {
         var x = a[item].toLowerCase(); var y = b[item].toLowerCase();
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
          });
      }
      else if (item == "genre"){ 
        all.sort(function(a, b) {
          JSON.parse(a[item])
          var x = JSON.parse(a[item]); var y = JSON.parse(b[item]);
          if(x[0] === y[0]){
            var x = a['title'].toLowerCase().trim(); var y = b['title'].toLowerCase().trim();
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
          }
          else
            return ((x[0] < y[0]) ? -1 : ((x[0] > y[0]) ? 1 : 0));
        });
      }
      else if (item == "oldest" || item == "newest"){
        all.sort(function(a, b) {
          if(parseInt(a['year']) === parseInt(b['year'])){
            var x = a['title'].toLowerCase().trim(); var y = b['title'].toLowerCase().trim();
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
          }
          return a['year'] - b['year'];
        });
        if(item == "newest")
          all.reverse()
      }
      else if (item == "rating"){ 
        all.sort(function(a, b) {
          var x = parseFloat(a[item]); var y = parseFloat(b[item]);
          if(isNaN(x))
            return -1
          else if (isNaN(y))
            return 1
          if(parseFloat(a['rating']) === parseFloat(b['rating'])){
            var x = a['title'].toLowerCase().trim(); var y = b['title'].toLowerCase().trim();
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
          }
          else
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
        all.reverse()
      }
      this.library = all
      if(item == "genre")
        console.log(all)
      all = []
    }
  }
}
</script>

<style scoped>
  .row{
    margin-top: 10px;
    margin-bottom: 10px;
  }
  .card-title{
    word-wrap: break-word
  }
  #sortnfilter{
    background-color: #353434;
    border-radius: 8px;
  }
  li{
    list-style: none;
    color: #939393;
  }
  a{
    text-decoration: none;
    color: #939393;
  }
</style>