
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github } from "lucide-react";

const GitHubIntegration = () => {
  return (
    <section className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github size={24} />
            How GitHub Integration Works
          </CardTitle>
          <CardDescription>
            A simple workflow to build your website from GitHub documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="bg-blue-100 p-2 rounded-full text-blue-700 mt-1">1</div>
              <div>
                <h3 className="font-medium">Create your GitHub repository</h3>
                <p className="text-gray-600 mt-1">
                  Start by creating a GitHub repository where you'll store all your website documentation
                  and specifications.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="bg-blue-100 p-2 rounded-full text-blue-700 mt-1">2</div>
              <div>
                <h3 className="font-medium">Add markdown documentation files</h3>
                <p className="text-gray-600 mt-1">
                  Create markdown files with your website requirements, design specifications,
                  content, and any other details we need to build your site.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="bg-blue-100 p-2 rounded-full text-blue-700 mt-1">3</div>
              <div>
                <h3 className="font-medium">We implement your website</h3>
                <p className="text-gray-600 mt-1">
                  Based on your documentation, we'll build your website to match your exact 
                  specifications, keeping you updated throughout the process.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="bg-blue-100 p-2 rounded-full text-blue-700 mt-1">4</div>
              <div>
                <h3 className="font-medium">Continuous updates</h3>
                <p className="text-gray-600 mt-1">
                  As you update your GitHub repository with new requirements or changes, 
                  we can continuously update your website accordingly.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default GitHubIntegration;
