<script setup lang="ts">
import { IntersectionResponse } from '~~/server/api/intersector.post';

const props = defineProps<{
	credit: IntersectionResponse['people'][number]['credits'][number];
}>();
const isMovie = props.credit.media_type === 'movie';
const title = isMovie
	? props.credit.mediaDetails.title
	: props.credit.mediaDetails.name;

const creditName: string = (() => {
	if (isMovie) {
		if (props.credit.credit.type === 'crew') {
			return props.credit.credit.job + '';
		}
		return props.credit.credit.character + '';
	}
	if (props.credit.credit.type === 'crew') {
		return props.credit.credit.jobs
			.map((job) => `${job.job} (episodes:${job.episode_count})`)
			.toString();
	}
	return props.credit.credit.roles
		.map((role) => `${role.character} (episodes:${role.episode_count})`)
		.toString();
})();
</script>

<template>
	<v-list-item>
		<div class="text-subtitle-1">
			{{ title }}
		</div>
		<div class="text-subtitle-2 text-medium-emphasis">
			{{ creditName }}
		</div>
	</v-list-item>
</template>
