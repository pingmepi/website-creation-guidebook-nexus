
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import GitHubIntegration from "@/components/GitHubIntegration";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="max-w-4xl mx-auto text-center mb-16 mt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Waiting for Your GitHub Repository
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            This website will be built based on the documentation you provide in your GitHub repository.
            Once you've added the documentation, we'll transform it into a beautiful, functional website.
          </p>
          <div className="flex justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Ready to Start
            </Button>
          </div>
        </section>

        <GitHubIntegration />
        
        <section className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Next Steps</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium text-lg mb-2">1. Create Repository</h3>
                <p className="text-gray-600">Create your GitHub repository and invite collaborators if needed</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium text-lg mb-2">2. Add Documentation</h3>
                <p className="text-gray-600">Add detailed specifications and requirements as markdown files</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium text-lg mb-2">3. Build Website</h3>
                <p className="text-gray-600">We'll implement your website based on the provided documentation</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <footer className="py-8 bg-gray-100 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} - Waiting for your GitHub repository</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
