import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type UserId = Principal.Principal;
  type AccountName = Text;

  type OldActor = {};

  type Account = {
    accountName : AccountName;
    nickname : Text;
    hashedPassword : Text;
  };

  type NewActor = {
    users : Map.Map<UserId, Account>;
    accounts : Map.Map<AccountName, UserId>;
    sessions : Map.Map<UserId, Text>;
    accountIdCounter : Nat;
  };

  public func run(_old : OldActor) : NewActor {
    {
      users = Map.empty<UserId, Account>();
      accounts = Map.empty<AccountName, UserId>();
      sessions = Map.empty<UserId, Text>();
      accountIdCounter = 0;
    };
  };
};
