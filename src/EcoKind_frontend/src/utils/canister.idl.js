export const idlFactory = ({ IDL }) => {
  const Project = IDL.Text;
  const Key = IDL.Text;
  const Message = IDL.Record({
    'content' : IDL.Text,
    'sender' : IDL.Text,
    'timestamp' : IDL.Int,
    'receiver' : IDL.Text,
  });
  return IDL.Service({
    'clearMessages' : IDL.Func([], [IDL.Bool], []),
    'deleteUserMessages' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'editMessage' : IDL.Func([IDL.Text, IDL.Nat, IDL.Text], [IDL.Bool], []),
    'generateKey' : IDL.Func([IDL.Principal, Project], [IDL.Opt(Key)], []),
    'harassmentLevel' : IDL.Func([IDL.Text], [IDL.Text], []),
    'receiveMessages' : IDL.Func([IDL.Text], [IDL.Vec(Message)], []),
    'sendMessage' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Bool], []),
    'suggestImprovedMessage' : IDL.Func([IDL.Text], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };