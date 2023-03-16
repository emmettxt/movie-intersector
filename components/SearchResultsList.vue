<script setup lang="ts">
import { TvShowGeneric, MovieGeneric } from '~~/server/utils/types/tmdbAPI';

const props = defineProps<{ results: (TvShowGeneric | MovieGeneric)[] }>();
</script>

<template>
	<v-list>
		<v-list-item v-for="(result, index) in props.results" :key="index">{{
			result.media_type === 'movie' ? result.title : result.name
		}}</v-list-item>
	</v-list>
</template>
