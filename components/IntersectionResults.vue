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
	<v-btn class="ma-3" @click="loadIntersection">Intersect</v-btn>
	<div v-if="intersection" class="card-container">
		<v-row no-gutters fill-height>
			<v-col
				v-for="person of intersection.people"
				:key="person.person.id"
				fill-height
				class="v-col-4 fill-height"
			>
				<v-card fill-height>
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
								<v-list lines="two" density="compact">
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
			</v-col>
		</v-row>
	</div>
</template>

<!-- <style scoped>
.card-container {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(4, 1fr);
}
.card-container > * {
	/* width: 300px; */
	/* flex-basis: 30%;
	flex-grow: 1;
	flex-shrink: 0; */
}
</style> -->
