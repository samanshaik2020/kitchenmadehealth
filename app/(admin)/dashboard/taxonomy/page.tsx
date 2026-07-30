import { Tags } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { TaxonomySection } from "@/components/admin/taxonomy-section";
import { getTaxonomyData } from "@/lib/admin-data";

export default async function TaxonomyPage() {
  const { categories, tags } = await getTaxonomyData();

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-7 lg:p-10">
      <AdminPageHeader
        eyebrow="Content architecture"
        title="Categories & tags"
        description="Keep the journal navigable. Create precise labels, rename them safely, or merge overlapping ideas without orphaning posts."
        icon={Tags}
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <TaxonomySection
          kind="category"
          title="Categories"
          description="Broad shelves used for primary navigation and URLs."
          items={categories}
        />
        <TaxonomySection
          kind="tag"
          title="Tags"
          description="Flexible labels for topics, formats, and reader intent."
          items={tags}
        />
      </div>
    </div>
  );
}
