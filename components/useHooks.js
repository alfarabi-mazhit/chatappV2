import { useEffect, useState } from "react";
import {checkPermission,requestPermission,getAll} from "react-native-contacts";

export function useContacts() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    checkPermission().then(permission => {
      if (permission === "undefined") {
        requestPermission().then(permission => {
          if (permission === "authorized") {
            loadContacts();
          }
        });
      }
      if (permission === "authorized") {
        loadContacts();
      }
    });
  }, []);

  const loadContacts = () => {
    getAll().then(contacts => {
      setContacts(
        contacts
          .filter(
            (c) => c.givenName && c.emailAddresses && c.emailAddresses.length > 0
          )
          .map(mapContactToUser)
          .reduce((acc, curr) => acc.concat(curr), [])
      );
    });
  };
  return contacts;
}

function mapContactToUser(contact) {
  return contact.emailAddresses.map((e) => {
    return {
      contactName:
        contact.givenName && contact.familyName
          ? `${contact.givenName} ${contact.familyName}`
          : contact.givenName,
      email: e.email,
    };
  });
}
