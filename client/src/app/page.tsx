import FileUploadComponent from "../components/custom-components/FileUploadComponent";
import ChatComponent from "../components/custom-components/Chat";

export default function Home() {
  return (
    <div>
      <div className="w-screen flex">
        <div className="w-[30vw] min-h-screen p-4 flex justify-center items-center">
          <FileUploadComponent />
        </div>
        <div className="w-[70vw] min-h-screen border-l-2 border-white">
          <ChatComponent />
        </div>
      </div>
    </div>
  );
}
