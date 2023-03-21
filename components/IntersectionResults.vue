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
	<v-container v-if="intersection" class="pa-0">
		<v-row>
			<v-col
				v-for="person of intersection.people"
				:key="person.person.id"
				cols="12"
				sm="6"
				md="4"
				xl="3"
			>
				<v-card height="100%">
					<v-container class="pa-0">
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
	</v-container>
</template>
