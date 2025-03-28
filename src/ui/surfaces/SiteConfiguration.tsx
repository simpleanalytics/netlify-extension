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
  doNotTrackSettingSchema, 
  ignorePagesSettingSchema,
  overwriteDomainSettingSchema,
  hashModeSettingSchema,
  collectPageViewsSettingSchema,
  siteSettingsSchema,
} from "../../schema/settings";

function DoNotTrackSettings() {
  const trpcUtils = trpc.useUtils();
  const query = trpc.siteSettings.doNotTrack.query.useQuery();
  const mutation = trpc.siteSettings.doNotTrack.mutate.useMutation({
    onSuccess: async () => {
      await trpcUtils.siteSettings.doNotTrack.query.invalidate();
    },
  });

  if (query.isLoading) {
    return <CardLoader />;
  }

  return (
    <Card>
      <CardTitle>DoNotTrack visits</CardTitle>
      <p>
        The Do Not Track setting requests that a web application disables
        either its tracking or cross-site user tracking of an individual user.
        We don't do that ever, so you can select to collect those visits as
        well.
      </p>
      <Form
          defaultValues={
            query.data ?? {
              enabled: false,
            }
          }
          schema={doNotTrackSettingSchema}
          onSubmit={mutation.mutateAsync}
        >
          <Checkbox name="enabled" label="Collect DoNotTrack visits" />
      </Form>
    </Card>
  );
}

function IgnorePagesSettings() {
  const trpcUtils = trpc.useUtils();
  const query = trpc.siteSettings.ignorePages.query.useQuery();
  const mutation = trpc.siteSettings.ignorePages.mutate.useMutation({
    onSuccess: async () => {
      await trpcUtils.siteSettings.ignorePages.query.invalidate();
    },
  });

  if (query.isLoading) {
    return <CardLoader />;
  }

  return (
    <Card>
      <CardTitle>Ignore pages</CardTitle>
      <p>
        Not want to run Simple Analytics on certain pages? Enter them here.
        You can use asterisks (*) to specify multiple pages.
      </p>
      <p>
        Example: /page1,/page2,/admin/*
      </p>
      <Form 
        defaultValues={
          query.data ?? {
            pages: "",
          }
        }
        schema={ignorePagesSettingSchema}
        onSubmit={mutation.mutateAsync}
      >
        <FormField
          name="pages"
          type="text"
          label="Ignore pages"
          placeholder="Enter pages or leave empty..."
        />
      </Form>
    </Card>
  );
}

function OverwriteDomainSettings() {
  const trpcUtils = trpc.useUtils();
  const query = trpc.siteSettings.overwriteDomain.query.useQuery();
  const mutation = trpc.siteSettings.overwriteDomain.mutate.useMutation({
    onSuccess: async () => {
      await trpcUtils.siteSettings.overwriteDomain.query.invalidate();
    },
  });

  if (query.isLoading) {
    return <CardLoader />;
  }

  return (
    <Card>
      <CardTitle>Overwrite domain</CardTitle>
      <p>
        Are you running your website on a different domain than what is listed
        in Simple Analytics? Overwrite your domain name here.
      </p>
      <Form 
        defaultValues={
          query.data ?? {
            domain: "",
          }
        }
        schema={overwriteDomainSettingSchema}
        onSubmit={mutation.mutateAsync}
      >
        <FormField
          name="domain"
          type="text"
          label="Domain"
          placeholder="Enter domain or leave empty..."
        />
      </Form>
    </Card>
  );
}

function HashModeSettings() {
  const trpcUtils = trpc.useUtils();
  const query = trpc.siteSettings.hashMode.query.useQuery();
  const mutation = trpc.siteSettings.hashMode.mutate.useMutation({
    onSuccess: async () => {
      await trpcUtils.siteSettings.hashMode.query.invalidate();
    },
  });

  if (query.isLoading) {
    return <CardLoader />;
  }

  return (
    <Card>
      <CardTitle>Hash mode</CardTitle>
      <p>
        Enable hash mode to track URLs with hashes as separate page views.
      </p>
      <Form 
        defaultValues={
          query.data ?? {
            enabled: false,
          }
        }
        schema={hashModeSettingSchema}
        onSubmit={mutation.mutateAsync}
      >
        <Checkbox
          name="enabled"
          label="Enable hash mode"
        />
      </Form>
    </Card>
  );
}

function CollectPageViewsSettings() {
  const trpcUtils = trpc.useUtils();
  const query = trpc.siteSettings.collectPageViews.query.useQuery();
  const mutation = trpc.siteSettings.collectPageViews.mutate.useMutation({
    onSuccess: async () => {
      await trpcUtils.siteSettings.collectPageViews.query.invalidate();
    },
  });

  if (query.isLoading) {
    return <CardLoader />;
  }

  return (
    <Card>
      <CardTitle>Collect page views</CardTitle>
      <p>
        Enable or disable page view collection.
      </p>
      <Form 
        defaultValues={
          query.data ?? {
            enabled: true,
          }
        }
        schema={collectPageViewsSettingSchema}
        onSubmit={mutation.mutateAsync}
      >
        <Checkbox
          name="enabled"
          label="Collect page views"
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
        Enable or disable Simple Analytics for this site.
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
          label="Enable Simple Analytics"
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
        <DoNotTrackSettings />
        <IgnorePagesSettings />
        <OverwriteDomainSettings />
        <HashModeSettings />
        <CollectPageViewsSettings />
      </div>
    </SiteConfigurationSurface>
  );
}
