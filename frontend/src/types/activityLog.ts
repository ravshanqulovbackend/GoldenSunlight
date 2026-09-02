export type ActivityAction = "created" | "updated" | "deleted";

export interface ActivityLogEntry {
  id: number;
  actor_display: string;
  action: ActivityAction;
  action_display: string;
  model_name: string;
  object_id: number;
  object_repr: string;
  /** {maydon_nomi: [eski_qiymat, yangi_qiymat]} — faqat "updated" amalida to'ldiriladi. */
  changes: Record<string, [string, string]>;
  created_at: string;
}
