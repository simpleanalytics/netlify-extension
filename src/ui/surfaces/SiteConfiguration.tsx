import {
  Card,
  CardLoader,
  CardTitle,
  Checkbox,
  cn,
  Form,
  FormField,
  SiteConfigurationSurface,
} from "@netlify/sdk/ui/react/components";
import { trpc } from "../trpc";
import { 
  siteSettingsSchema,
  advancedSettingsSchema,
  eventSettingsSchema,
} from "../../schema/settings";

function AdvancedSettings() {
  const trpcUtils = trpc.useUtils();
  const query = trpc.siteSettings.advanced.query.useQuery();
  const mutation = trpc.siteSettings.advanced.mutate.useMutation({
    onSuccess: async () => {
      await trpcUtils.siteSettings.advanced.query.invalidate();
    },
  });

  if (query.isLoading) {
    return <CardLoader />;
  }

  return (
    <Card>
      <CardTitle>Advanced Settings</CardTitle>
      <Form
        className="pt-6"
        defaultValues={query.data ?? {
          collectDoNotTrack: false,
          collectPageViews: false,
          ignoredPages: "",
          overwriteDomain: "",
          hashMode: false,
        }}
        schema={advancedSettingsSchema}
        onSubmit={mutation.mutateAsync}
      >
        <Checkbox name="collectDoNotTrack" label="Collect DNT visits" helpText="The Do Not Track setting requests that a web application disables either its tracking or cross-site user tracking of an individual user. We don't do that ever, so you can select to collect those visits as well." />

        <Checkbox name="collectPageViews" label="Collect page views" helpText="Enable or disable page view collection." />

        <FormField
          name="ignoredPages"
          type="text"
          label="Ignore pages"
          helpText="Not want to run Simple Analytics on certain pages? Enter them here. You can use asterisks (*) to specify multiple pages, example: /page1,/page2,/admin/*"
        />

        <FormField
          name="overwriteDomain"
          type="text"
          label="Overwrite domain"
          helpText="Are you running your website on a different domain than what is listed in Simple Analytics? Overwrite your domain name here."
        />

        <Checkbox
          name="hashMode"
          label="Enable hash mode"
          helpText="Enable hash mode to track URLs with hashes as separate page views."
        />
      </Form>
    </Card>
  );
}

function EventSettings() {
  const trpcUtils = trpc.useUtils();
  const query = trpc.siteSettings.events.query.useQuery();
  const mutation = trpc.siteSettings.events.mutate.useMutation({
    onSuccess: async () => {
      await trpcUtils.siteSettings.events.query.invalidate();
    },
  });

  if (query.isLoading) {
    return <CardLoader />;
  }

  return (
    <Card>
      <CardTitle>Events Settings</CardTitle>
      <Form
        className="pt-6"
        defaultValues={query.data ?? {
          collectAutomatedEvents: false,
          collectDownloads: false,
          downloadExtensions: "",
          useTitle: false,
          fullUrls: false,
        }}
        schema={eventSettingsSchema}
        onSubmit={mutation.mutateAsync}
      >
        <Checkbox name="collectAutomatedEvents" 
          label="Collect automated events"
          helpText="It will track outbound links, email addresses clicks, and amount of downloads for common files (pdf, csv, docx, xlsx). Events will appear on your events page on simpleanalytics.com" />


        <Checkbox
          name="collectDownloads"
          label="Collect downloads"
          helpText="It will track downloads of certain files."
        />

        <FormField
          name="downloadExtensions"
          type="text"
          label="Extensions"
          helpText="Select the extensions you want to count the downloads of. Example (and default): pdf,csv,docx,xlsx,zip"
        />

        <Checkbox
          name="useTitle"
          label="Use title"
          helpText="Enable or disable title collection."
        />

        <Checkbox
          name="fullUrls"
          label="Full URLs"
          helpText="Enable or disable full URL collection."
        />
      </Form>
    </Card>
  );
}

function GeneralSettings() {
  const trpcUtils = trpc.useUtils();
  const query = trpc.siteSettings.general.query.useQuery();
  const mutation = trpc.siteSettings.general.mutate.useMutation({
    onSuccess: async () => {
      await trpcUtils.siteSettings.general.query.invalidate();
    },
  });

  if (query.isLoading) {
    return <CardLoader />;
  }

  return (
    <Card>
      <CardTitle>General</CardTitle>
      <p>
        Enable Simple Analytics for this site.
      </p>
      <Form 
        defaultValues={
          query.data ?? {
            enabled: true,
          }
        }
        schema={siteSettingsSchema}
        onSubmit={mutation.mutateAsync}
      >
        <Checkbox
          name="enabled"
          label="Enable analytics"
        />
      </Form>
    </Card>
  );
}

export function SiteConfiguration() {
  return (
    <SiteConfigurationSurface>
      <div className="space-y-6">
        <GeneralSettings />
        <AdvancedSettings />
        <EventSettings />
      </div>
    </SiteConfigurationSurface>
  );
}
