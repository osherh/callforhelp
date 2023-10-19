import { FirestoreDataConverter, Timestamp } from 'firebase/firestore';
import { z } from "zod"

const chatSchema = z.object({
  id: z.string(),
  supporterId: z.string().nullable(),
  supporteeId: z.string().nullable(),
  createdAt: z.instanceof(Timestamp),
});

type Chat = z.infer<typeof chatSchema>;

const chatFirestoreConverter: FirestoreDataConverter<Chat> = {
  toFirestore(chat) {
    return chat;
  },
  fromFirestore(snapshot, options) {
    const rawData = {id: snapshot.id, ...snapshot.data(options)}

    return chatSchema.parse(rawData);
  }
};

export { chatFirestoreConverter };
export type { Chat };
