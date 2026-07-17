import { SiteLayout, PageHero } from "@/components/site/site-layout";
import { BlogList } from "@/components/sections/blog-list";
import { getDbBlogPosts } from "@/lib/queries";

export default async function BlogPage() {
  const posts = await getDbBlogPosts();

  return (
    <SiteLayout>
      <PageHero
        eyebrow="From the clinic"
        title={<>Insights from our <span className="gradient-text">clinical team</span></>}
        description="Evidence-based articles on nutrition, metabolism, behaviour change and the latest research — written by our RDN-credentialed dietitians."
        accent="from-sky-500/15 to-blue-500/10"
      />
      <BlogList posts={posts} />
    </SiteLayout>
  );
}
