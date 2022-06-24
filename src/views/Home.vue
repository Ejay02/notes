<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSignOut, useUserId } from "@nhost/vue";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { gql } from "@apollo/client/core";

const router = useRouter();
const { signOut } = useSignOut();
const userId = useUserId();

const newNote = ref({
  title: "",
  content: "",
});

const logout = () => {
  signOut();

  router.push("/login");
};

const {
  loading: notesLoading,
  result: notesResult,
  refetch: notesRefetch,
} = useQuery(
  gql`
    query ($userId: String!) {
      notes(order_by: { created: desc }, where: { user_id: { _eq: $userId } }) {
        id
        title
        content
        created
      }
    }
  `,
  {
    userId: userId.value,
  }
);

const { mutate: createNote, onDone: createNoteDone } = useMutation(gql`
  mutation ($userId: String!, $title: String, $content: String!) {
    insert_notes_one(
      object: { content: $content, title: $title, user_id: $userId }
    ) {
      id
    }
  }
`);

const handleCreateNote = () => {
  if (!newNote.value.title || !newNote.value.content) {
    return alert("Please fill in all fields 🙏🏽");
  }

  createNote({
    userId: userId.value,
    title: newNote.value.title,
    content: newNote.value.content,
  });
};

createNoteDone(() => {
  notesRefetch();
  newNote.value = {
    title: "",
    content: "",
  };
});

// parse
const convertToHTML = (content) => {
  return content.replace(/\n/g, "<br />");
};

const convertToDate = (date) => {
  return new Date(date).toLocaleString();
};
</script>

<template>
  <main>
    <div class="flex items-centr justify-between mb-8">
      <h1 class="text-3xl font-bold">Notes App</h1>
      <button
        @click="logout"
        class="text-red-500 hover:underline cursor-pointer"
      >
        Logout
      </button>
    </div>
    <form action="" @submit.prevent="handleCreateNote" class="mb-8">
      <label for="" class="block mb-4">
        <span class="block text-sm uppercase mb2">Title</span>
        <input
          type="text"
          autofocus
          required
          v-model="newNote.title"
          placeholder="Title please?"
          class="block w-full text-slate-800 px-4 py-2 rounded-sm"
        />
      </label>
      <label for="" class="block mb-4">
        <span class="block text-sm uppercase mb2">Content</span>
        <textarea
          autofocus
          required
          rows="4"
          cols="50"
          v-model="newNote.content"
          placeholder="Content please?"
          class="block w-full text-slate-800 px-4 py-2 rounded-sm"
        ></textarea>
      </label>

      <input
        type="submit"
        value="Create something exciting 💫"
        class="text-green-500 hover:underline cursor-pointer"
      />
    </form>

    <div v-if="!notesLoading">
      <div
        v-for="note in notesResult.notes"
        :key="note"
        class="relative bg-white text-slate-700 rounded-lg p-6 mb-6"
      >
        <button class="class absolute top-6 right-6 text-red-500 font-bold">
          Delete 🚮
        </button>
        <h3 class="font-bold text-2xl mb-4">
          {{ note.title }}
        </h3>
        <p
          class="text-lg text-gray-500 mb-4"
          v-html="convertToHTML(note.content)"
        ></p>
        <div class="text-sm text-gray-500 italic">
          {{ convertToDate(note.created) }}
        </div>
      </div>
    </div>
  </main>
</template>
