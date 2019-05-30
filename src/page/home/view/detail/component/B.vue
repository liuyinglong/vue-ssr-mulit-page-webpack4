<template>
	<div>这个是B组件</div>
</template>

<script>
	export default{
	    asyncData(){
            console.log("B组件asyncData")
	      	return {
	      	    A:"ABC"
			}
		},
	    data(){
	        return {
	            A:"b"
			}
		},
        created(){
            console.log("B组件created")
        }
	}
</script>