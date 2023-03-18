<script setup lang="ts">
interface Item {
	title: string;
	id: number;
	posterURL: string;
}
const results = ref([] as Item[]);
const select = ref([] as number[]);
const searchQuery = ref('');
const loading = ref(false);

const appendToSelected = (items: Item[]) => {
	const ids = new Set([...select.value, ...items.map(({ id }) => id)]);
	const newResults = [] as Item[];

	Array.from(ids).forEach((id) => {
		const item = [...results.value, ...items].find((item) => item.id === id);
		if (item) newResults.push(item);
	});

	results.value = newResults;
};

watch(searchQuery, async (newSearchQuery) => {
	loading.value = true;
	if (!newSearchQuery) {
		appendToSelected([]);
		loading.value = false;
		return;
	}
	try {
		const { data } = await useFetch(`/api/search/${newSearchQuery}`);
		if (data.value) {
			const converted = data.value.map((item) => ({
				title: item.media_type === 'movie' ? item.title : item.name,
				id: item.id,
				posterURL: getPosterUrl(item.poster_path, 'w154'),
			}));
			appendToSelected(converted);
		}
	} catch (error) {
		appendToSelected([]);
	}
	loading.value = false;
});
</script>

<template>
	<div class="search-container">
		<v-autocomplete
			v-model:search="searchQuery"
			v-model="select"
			:loading="loading"
			:items="results"
			chips
			closable-chips
			item-value="id"
			item-title="title"
			label="Search"
			multiple
			no-filter
			hide-no-data
			clearable
			hide-selected
			persistent-clear
		>
			<!-- cache-items -->
			<template #chip="{ props, item }">
				<v-chip
					v-bind="props"
					:text="item.raw.title"
					:prepend-avatar="item.raw.posterURL"
				></v-chip>
			</template>

			<template #item="{ props, item }">
				<v-list-item
					v-bind="props"
					:prepend-avatar="item?.raw?.posterURL"
					:title="item?.raw?.title"
				></v-list-item>
			</template>
		</v-autocomplete>
	</div>
</template>
