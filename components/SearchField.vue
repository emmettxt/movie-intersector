<script setup lang="ts">
import { TvShowGeneric, MovieGeneric } from '~~/server/utils/types/tmdbAPI';
const blankResults: (TvShowGeneric | MovieGeneric)[] = [];
const results = reactive(blankResults);
const searchQuery = ref('');

watch(searchQuery, async (newSearchQuery) => {
	if (!newSearchQuery) {
		results.splice(0, results.length);
		return;
	}
	try {
		const { data } = await useFetch(`/api/search/${newSearchQuery}`);
		if (data.value) {
			const converted = JSON.parse(JSON.stringify(data.value)) as (
				| TvShowGeneric
				| MovieGeneric
			)[];
			results.splice(0, results.length, ...converted);
		}
	} catch (error) {
		results.splice(0, results.length);
	}
});
</script>

<template>
	<v-text-field v-model="searchQuery" label="Search for a movie"></v-text-field>
	<SearchResultsList :results="results" />
</template>
