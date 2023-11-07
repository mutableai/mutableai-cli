const { createClient } =
  require("@supabase/supabase-js") as typeof import("@supabase/supabase-js");
const fileUtils = require("./fileUtils");

let prevChangesets: any = null;

function createSupabaseClient(url: string, apiKey: string) {
  const supabase = createClient(url, apiKey, {
    auth: {
      persistSession: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
  return supabase;
}

function handleFileChangePayload(data: {
  type: "broadcast";
  event: string;
  [key: string]: any;
}) {
  for (const changeset of data.payload) {
    if (changeset.mode == "M" || changeset.mode == "A") {
      try {
        fileUtils.modifyFile(changeset.path, changeset.content);
      } catch (err) {
        console.error(
          `[ERROR] encountered error while modify/add ${changeset.path}`
        );
      }
    } else if (changeset.mode == "D") {
      try {
        fileUtils.deleteFile(changeset.path);
      } catch (err) {
        console.error(
          `[ERROR] encountered error while trying to delete ${changeset.path}`
        );
      }
    }
  }
  // find files that were deleted between changeset
  if (prevChangesets == null) {
    prevChangesets = data.payload;
  } else {
    for (const prevChangeset of prevChangesets) {
      let found = false;
      for (const curChangeset of data.payload) {
        if (curChangeset.path == prevChangeset.path) {
          found = true;
          break;
        }
      }
      // a file is deleted from the current changeset
      if (!found) {
        console.log(
          `[INFO] this file is deleted from the changeset ${prevChangeset.path}. Restoring original version`
        );
        try {
          fileUtils.restoreFile(prevChangeset.path);
        } catch (err) {
          console.error(`[ERROR] failed to restore ${prevChangeset.path}`);
        }
      }
    }
    prevChangesets = data.payload;
  }
}

function sendHeartBeat(channel: any, connectionId: string) {
  channel.send({
    type: "broadcast",
    event: "cli_heartbeat",
    payload: { connection_id: connectionId, timestamp: Date.now() },
  });
}

function setupSyncChannel(url: string, apiKey: string, session: string) {
  const client = createSupabaseClient(url, apiKey);
  const connection_id = `s_${session}_${Date.now()}`;
  try {
    // Supabase client setup
    const channel = client.channel(session, {
      config: {
        broadcast: {
          self: false,
        },
      },
    });
    channel
      .on("broadcast", { event: "file_changed" }, handleFileChangePayload)
      .subscribe((status: any) => {
        if (status === "SUBSCRIBED") {
          console.log("[INFO] Trying to obtain latest changeset from webapp");
          channel.send({
            type: "broadcast",
            event: "cli_connected",
            payload: { connection_id: connection_id },
          });
          sendHeartBeat(channel, connection_id);
        } else {
          console.error("[ERROR] Failed to subscribe");
        }
      });
    // setup periodic heartbeat sending
    setInterval(() => {
      sendHeartBeat(channel, connection_id);
    }, 5 * 1000); // every 5 seconds
  } catch (error) {
    console.error("[ERROR] encountered an error while syncing with webapp");
  }
}

export {};
exports.setupSyncChannel = setupSyncChannel;
