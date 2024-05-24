import { Form, ActionPanel, Action, getPreferenceValues } from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";
import got, { RequestError } from 'got';
import { useState } from "react";

export default function Command() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { apiKey, inboxListId } = getPreferenceValues();
  
  const { handleSubmit, itemProps, reset } = useForm<{ tasks: string }>({
    initialValues: {
      tasks: '',
    },
    validation: {
      tasks: FormValidation.Required,
    },
    async onSubmit(values) {
      try {
        setIsSubmitting(true);
        
        if (typeof values.tasks === 'string') {
          const tasks = values.tasks.split('\n').map(task => task.trim()).filter(task => task.length > 0);
          
          for (const task of tasks) {
            await got(`https://api.clickup.com/api/v2/list/${inboxListId}/task`, {
              method: 'post',
              body: JSON.stringify({
                name: task
              }),
              headers: {
                Authorization: apiKey,
                'Content-Type': 'application/json',
              },
            })
          }

          reset();
        }
      } catch (err) {
        if (err instanceof RequestError) {
          console.error(err.request?.requestUrl?.href);
          console.error(err.response?.body);
          console.error(err.request?.options.body);
        }
        
        throw err;
      } finally {
        setIsSubmitting(false)
      }
    },
  })
  
  return (
    <Form
      navigationTitle="Collect Tasks"
      isLoading={isSubmitting}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save"
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.Description text="Great job! Keep capturing those tasks for a clearer mind." />
      <Form.Separator />
      <Form.Description title="Status" text="INBOX" />
      <Form.TextArea title="Tasks" {...itemProps.tasks} />
    </Form>
  )
}