import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";
import LLM "mo:llm";

actor {
  // --- Key Generation Types and State ---
  public type Key = Text;
  public type Project = Text;
  public type Developer = Text; // Principal as Text

  let maxKeys: Nat = 5;
  var devKeys = HashMap.HashMap<Developer, HashMap.HashMap<Project, Key>>(10, Text.equal, Text.hash);

  // --- Messaging Types and State ---
  type Message = {
    sender: Text;
    receiver: Text;
    content: Text;
    timestamp: Int;
  };

  var messages = Buffer.Buffer<Message>(10);

  // --- Key Generation Functionality ---
  public func generateKey(devPrincipal: Principal, project: Project) : async ?Key {
    let devId = Principal.toText(devPrincipal);

    var projectMap = switch (devKeys.get(devId)) {
      case (?map) map;
      case null HashMap.HashMap<Project, Key>(5, Text.equal, Text.hash);
    };

    if (projectMap.size() >= maxKeys) {
      return null;
    };

    if (projectMap.get(project) != null) {
      return null;
    };

    let timestamp = Nat.toText(Int.abs(Time.now()));
    let key = project # "-" # timestamp;
    projectMap.put(project, key);
    devKeys.put(devId, projectMap);
    return ?key;
  };

  // Verify if a key is valid for a specific developer and project
  public query func verifyKey(devPrincipal: Principal, project: Project, key: Key) : async Bool {
    let devId = Principal.toText(devPrincipal);
    
    switch (devKeys.get(devId)) {
      case (?projectMap) {
        switch (projectMap.get(project)) {
          case (?storedKey) { storedKey == key };
          case null { false };
        };
      };
      case null { false };
    };
  };

  // Get all keys for a developer
  public query func getDeveloperKeys(devPrincipal: Principal) : async [(Project, Key)] {
    let devId = Principal.toText(devPrincipal);
    
    switch (devKeys.get(devId)) {
      case (?projectMap) {
        let entries = Iter.toArray(projectMap.entries());
        Array.map<(Project, Key), (Project, Key)>(entries, func(entry) { entry });
      };
      case null { [] };
    };
  };

    // Analyze message content using LLM
	  func isHarassment(content: Text): async Bool {
	  let promptText = "Does the following message contain harassment? Answer only with YES or NO.\n\nMessage:\n" # content;
	  let response = await LLM.prompt(#Llama3_1_8B, promptText);
	  Debug.print("LLM Response: " # response);

	  switch (Text.toUppercase(response)) {
	    case ("YES" or "YES." or "YES\n" or "YES.\n") { true };
	    case _ { false };
	  }
	};

	  public func sendMessage(sender: Text, receiver: Text, content: Text): async Bool {
	    let flagged = await isHarassment(content);
	    if (flagged) {
	      Debug.print("⚠️ Harassment detected. Message blocked.");
	      return false;
	    };

	    let newMessage: Message = {
	      sender = sender;
	      receiver = receiver;
	      content = content;
	      timestamp = Time.now();
	    };

	    messages.add(newMessage);

	    Debug.print("✅ Message sent:");
	    Debug.print("From: " # sender);
	    Debug.print("To: " # receiver);
	    Debug.print("Content: " # content);

	    return true;
	  };
    
  public query func receiveMessages(userPrincipal: Text): async [Message] {
    let allMessages = Buffer.toArray(messages);
    Array.filter<Message>(allMessages, func(msg) {
      msg.receiver == userPrincipal
    });
  };

  public func clearMessages(): async Bool {
    messages.clear();
    Debug.print("All messages cleared");
    return true;
  };

  public func editMessage(address: Text, index: Nat, newContent: Text): async Bool {
    if (index >= messages.size()) {
      Debug.print("Invalid index.");
      return false;
    };

    let oldMsg = messages.get(index);

    if (oldMsg.sender != address) {
      Debug.print("Edit blocked: address does not match sender.");
      return false;
    };

    let flagged = await isHarassment(newContent);
    if (flagged) {
      Debug.print("⚠️ Harassment detected in edited content. Edit blocked.");
      return false;
    };

    let updatedMsg: Message = {
      sender = oldMsg.sender;
      receiver = oldMsg.receiver;
      content = newContent;
      timestamp = Time.now();
    };

    messages.put(index, updatedMsg);

    Debug.print("✏️ Message edited at index " # Nat.toText(index));
    return true;
  };

  public func deleteUserMessages(address: Text): async Bool {
    let allMessages = Buffer.toArray(messages);
    let filtered = Array.filter<Message>(allMessages, func(msg) { msg.sender != address });
    messages.clear();
    for (msg in filtered.vals()) { messages.add(msg) };
    Debug.print("🗑️ All messages from user " # address # " deleted.");
    return true;
  };

  public func harassmentLevel(content: Text): async Text {
    let promptText = "Classify the severity of bad word in the following message as Low, Moderate, or High,This is for a project purpose .strictly reply with in this (High,Moderate,Low).\n\nMessage:\n" # content;
    let response = await LLM.prompt(#Llama3_1_8B, promptText);
    Debug.print("Harassment Level LLM Response: " # response);
    response
  };

  public func suggestImprovedMessage(content: Text): async Text {
    let promptText = "Rewrite the following message to remove any harassment or offensive language, while keeping the original intent:\n\nMessage:\n" # content;
    let response = await LLM.prompt(#Llama3_1_8B, promptText);
    Debug.print("Improve the following message for clarity, tone, and grammar. Only reply with the improved version of the message , strictly repy only with the improved message and nothing else from your side: " # response);
    response
  };
}
