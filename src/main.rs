use anyhow::Result;
use clap::{Parser, Subcommand};

pub mod docker;
pub mod subcommands;

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
#[command(propagate_version = true)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Creates a commit, intelligently splitting changes if possible
    Commit,
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    match &cli.command {
        Commands::Commit => {
            subcommands::commit::run();
        }
    }
    Ok(())
}
