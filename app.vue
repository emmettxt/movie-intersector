<script setup lang="ts">
const sets = useSets();
</script>

<template>
	<v-container>
		<v-row>
			<v-col v-for="(value, setId) in sets" :key="setId">
				<SetSelectorCard :set-id="setId" />
			</v-col>
		</v-row>
	</v-container>
</template>
