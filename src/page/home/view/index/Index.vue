<template>
	<div>
		<div class="test">{{a}}</div>
		<router-link to="/detail">Detail</router-link>
	</div>
</template>


<style scoped lang="scss">
	.test {
		background: red;
	}
</style>

<script>
    export default {
        asyncData() {
            return {
                a: 4
            }
        },
        data() {
            return {
                a: "1"
            }
        }
    }
</script>