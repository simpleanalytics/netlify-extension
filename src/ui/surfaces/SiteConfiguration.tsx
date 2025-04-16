import {
  Card,
  CardLoader,
  CardTitle,
  Checkbox,
  Form,
  FormField,
  SiteConfigurationSurface,
} from "@netlify/sdk/ui/react/components";
import { trpc } from "../trpc";
import { 
  generalSettingsSchema,
  advancedSettingsSchema,
  eventSettingsSchema,
} from "../../schema/settings";
import { useState } from "react";

function AdvancedSettings() {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const trpcUtils = trpc.useUtils();
  const query = trpc.siteSettings.advanced.query.useQuery();
  const mutation = trpc.siteSettings.advanced.mutate.useMutation({
    onSuccess: async () => {
      setHasSubmitted(true);

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
        className="tw-pt-6 tw-max-w-170"
        defaultValues={query.data ?? {
          customDomain: "", // default = undefined
          collectDoNotTrack: false,
          collectPageViews: true,
          ignoredPages: "", // default = undefined
          overwriteDomain: "", // default = undefined
          hashMode: false,
        }}
        schema={advancedSettingsSchema}
        onSubmit={mutation.mutateAsync}
      >
        <FormField
          name="customDomain"
          type="text"
          label="Custom domain"
          helpText="A custom domain can help with by-passing ad-blockers. It's not required and if you don't know what it is, just leave it empty. (default: empty)"
        />

        <Checkbox name="collectDoNotTrack" label="Collect DNT visits" helpText="The Do Not Track setting requests that a web application disables either its tracking or cross-site user tracking of an individual user. We don't do that ever, so you can select to collect those visits as well. (default: off)" />

        <Checkbox name="collectPageViews" label="Collect page views" helpText="Enable or disable page view collection. (default: on)" />

        <FormField
          name="ignoredPages"
          type="text"
          label="Ignore pages"
          helpText="Not want to run Simple Analytics on certain pages? Enter them here. You can use asterisks (*) to specify multiple pages, example: /page1,/page2,/admin/* (default: empty)"
        />

        <FormField
          name="overwriteDomain"
          type="text"
          label="Overwrite domain"
          helpText="Are you running your website on a different domain than what is listed in Simple Analytics? Overwrite your domain name here. (default: empty)"
        />

        <Checkbox
          name="hashMode"
          label="Enable hash mode"
          helpText="Enable hash mode to track URLs with hashes as separate page views. (default: false)"
        />
      </Form>

      {hasSubmitted && <p>Your settings have been saved. You must trigger a new production deploy for the changes to take effect.</p>}
    </Card>
  );
}

function EventSettings() {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const trpcUtils = trpc.useUtils();
  const query = trpc.siteSettings.events.query.useQuery();
  const mutation = trpc.siteSettings.events.mutate.useMutation({
    onSuccess: async () => {
      setHasSubmitted(true);

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
        className="tw-pt-6 tw-max-w-170"
        defaultValues={query.data ?? {
          collectAutomatedEvents: true,
          collectDownloads: true,
          collectEmailClicks: true,
          collectOutboundLinks: true,
          downloadExtensions: "", // default = undefined
          useTitle: true,
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
          helpText="It will track downloads of certain files. (default: on)"
        />

        <Checkbox
          name="collectOutboundLinks"
          label="Collect outbound links"
          helpText="It will track clicks on links to other websites. (default: on)"
        />

        <Checkbox
          name="collectEmailClicks"
          label="Collect email clicks"
          helpText="It will track clicks on email addresses. (default: on)"
        />

        <FormField
          name="downloadExtensions"
          type="text"
          label="Extensions"
          placeholder="pdf,csv,docx,xlsx,zip,doc,xls"
          helpText="Select the extensions you want to count the downloads of. (default: 'pdf,csv,docx,xlsx,zip,doc,xls')"
        />

        <Checkbox
          name="useTitle"
          label="Use title"
          helpText="Enable or disable title collection. (default: on)"
        />

        <Checkbox
          name="fullUrls"
          label="Full URLs"
          helpText="Enable or disable full URL collection. (default: off)"
        />
      </Form>

      {hasSubmitted && <p>Your settings have been saved. You must trigger a new production deploy for the changes to take effect.</p>}
    </Card>
  );
}

function GeneralSettings() {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const trpcUtils = trpc.useUtils();
  const query = trpc.siteSettings.general.query.useQuery();
  const mutation = trpc.siteSettings.general.mutate.useMutation({
    onSuccess: async () => {
      setHasSubmitted(true);

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
        className="tw-pt-6 tw-max-w-170"
        defaultValues={
          query.data ?? {
            collectAutomatedEvents: true,
            enableProxy: false,
          }
        }
        schema={generalSettingsSchema}
        onSubmit={mutation.mutateAsync}
      >
        <Checkbox name="collectAutomatedEvents" 
          label="Collect automated events"
          helpText="It will track outbound links, email addresses clicks, and amount of downloads for common files (pdf, csv, docx, xlsx). Events will appear on your events page on simpleanalytics.com. (default: on)" />

        <Checkbox
          name="enableProxy"
          label="Enable analytics proxy"
          helpText="Enable the proxying to prevent metrics from being blocked by ad-blocking extensions. (default: off)"
        />
      </Form>

      {hasSubmitted && <p>Your settings have been saved. You must trigger a new production deploy for the changes to take effect.</p>}
    </Card>
  );
}

export function SiteConfiguration() {
  return (
    <SiteConfigurationSurface>
      <GeneralSettings />
      <AdvancedSettings />
      <EventSettings />
    </SiteConfigurationSurface>
  );
}
