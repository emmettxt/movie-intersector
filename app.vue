<script setup lang="ts">
import { useSets } from './composables/sets';
const sets = useSets();
</script>

<template>
	<v-container>
		<v-row>
			<v-col v-for="(value, setId) in sets" :key="setId">
				<SetSelectorCard :set-id="setId" />
			</v-col>
		</v-row>
		<v-row>
			<v-col>
				<IntersectionResults></IntersectionResults>
			</v-col>
		</v-row>
	</v-container>
</template>
