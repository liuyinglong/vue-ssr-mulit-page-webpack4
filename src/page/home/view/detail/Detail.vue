<template>
	<div>
		<div>这里这个是详情</div>
		<div>
			<div>
				<router-link to="/detail/a">detail A</router-link>
			</div>
			<div>
				<router-link to="/detail/b">detail B</router-link>
			</div>
		</div>

		<p>--------------</p>
		<div>
			<keep-alive>
				<router-view></router-view>
			</keep-alive>
		</div>
	</div>
</template>

<script>
	export default {
        created(){
            console.log("Detail组件created")
        }
	}
</script>