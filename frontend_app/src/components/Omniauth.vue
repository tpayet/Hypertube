<template>
	<div class="omniauth">
	</div>		
</template>

<script>
import {userUrl} from '@/config.js'

export default{
  name: 'omniauth',
  data(){
    return {
      headers: {
      'access-token': this.$route.query.token,
      'client': this.$route.query.client,
      'expiry': this.$route.query.expiry,
      'token-type': 'Bearer',
      'uid': this.$route.query.uid,
      'Content-Type': 'application/json'
      },
  	}
	},
  created: function(){
	localStorage.setItem('token', this.$route.query.token)
	localStorage.setItem('client', this.$route.query.client)
	localStorage.setItem('expiry', this.$route.query.expiry)
	localStorage.setItem('token-type', 'Bearer')
  localStorage.setItem('uid', this.$route.query.uid)
	localStorage.setItem('omniauth', true)

	axios({
      method: 'get',
      url: userUrl + this.$route.query.uid,
      headers: this.headers
    })
    .then( (response) => {
      this.userName = response.data.username
      this.email = response.data.email
      this.firstName = response.data.firstname
      this.lastName = response.data.lastname
      this.usersPicture = userUrl + this.$route.params.username + '/avatar';
      localStorage.setItem('id', response.data['id'])
      localStorage.setItem('email', response.data['email'])
      localStorage.setItem('picture', response.data['picture'])
      localStorage.setItem('firstname', response.data['firstname'])
      localStorage.setItem('lastname', response.data['lastname'])
      localStorage.setItem('username', response.data['username'])
    })
    .catch( (error) => {
      console.log(error)
    });
	
	this.$router.push('/')
  }
}

</script>

<style scoped >
</style>