<script setup lang="ts">
import { useSets } from '../composables/sets';
import { IntersectionResponse } from '~~/server/api/intersector.post';

const sets = useSets();

const intersection = ref<IntersectionResponse>();

const loadIntersection = async () => {
	const setsToSend = Object.values(sets.value).map((set) =>
		// eslint-disable-next-line camelcase
		set.map(({ media_type, id }) => ({ media_type, id }))
	);

	const { data } = await useFetch('/api/intersector', {
		method: 'post',
		body: { sets: setsToSend },
	});
	if (data.value) intersection.value = data.value;
};
</script>
<template>
	<v-card>
		<v-btn class="ma-3" @click="loadIntersection">Intersect</v-btn>
		<div v-if="intersection" class="card-container">
			<v-card
				v-for="person of intersection.people"
				:key="person.person.id"
				width="300"
			>
				<v-container>
					<v-row>
						<v-col class="v-col-5">
							<v-img :src="getProfileUrl(person.person.profile_path, 'w185')">
							</v-img>
							<div class="text-center pa-1 text-body-1">
								{{ person.person.name }}
							</div>
						</v-col>
						<v-col class="v-col-7">
							<v-list lines="two">
								<CreditListItem
									v-for="credit in person.credits"
									:key="credit.credit.id"
									:credit="credit"
								/>
							</v-list>
						</v-col>
					</v-row>
				</v-container>
			</v-card>
		</div>
	</v-card>
</template>

<style scoped>
.card-container {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	padding: 1rem;
	justify-content: space-evenly;
}
</style>
