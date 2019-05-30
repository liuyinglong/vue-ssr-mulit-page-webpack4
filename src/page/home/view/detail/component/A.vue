<template>
	<div>{{A}}</div>
</template>

<script>
	export default{
	    asyncData(){
	        console.log("A组件asyncData")
	      	return {
	      	    A:"A组件"
			}
		},
	    data(){
	        return {
	            A:"a"
			}
		},
		created(){
            console.log("A组件created")
		}
	}
</script>