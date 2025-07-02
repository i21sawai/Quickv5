import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'パスワード',
      credentials: {
        username: { label: '名前', type: 'text' },
        password: { label: 'パスワード', type: 'password' },
      },
      // ... 前略

async authorize(credentials, req) {
        console.log('--- START NextAuth Authorize Function Debug Log ---'); // authorize関数の開始ログ

        // 環境変数の値を確認するためのログ出力 (デバッグ用)
        console.log('Environment Variable Check:');
        console.log('  SA_CLIENT_EMAIL:', process.env.SA_CLIENT_EMAIL);
        console.log('  USER_SPREADSHEET_ID:', process.env.USER_SPREADSHEET_ID);
        console.log('  SA_PRIVATE_KEY_EXISTS:', !!process.env.SA_PRIVATE_KEY); // 秘密鍵が存在するかどうか
        if (process.env.SA_PRIVATE_KEY) {
            // 秘密鍵の冒頭部分のみを出力 (完全な出力は避ける)
            console.log('  SA_PRIVATE_KEY_START:', process.env.SA_PRIVATE_KEY.substring(0, 30) + '...');
        }
        console.log('  NEXTAUTH_SECRET_IS_SET:', !!process.env.NEXTAUTH_SECRET); // NextAuth Secretが設定されているか
        if (!process.env.NEXTAUTH_SECRET) {
            console.log('  WARNING: NEXTAUTH_SECRET is NOT SET or empty!');
        }

        let user:
          | {
              email: string;
              name: string;
              id: string;
              role: string;
            }
          | undefined; // 認証成功時に返されるユーザーオブジェクト

        // Google サービスアカウント認証オブジェクトの作成
        const serviceAccountAuth = new JWT({
          // 環境変数からサービスアカウントのメールアドレスと秘密鍵を取得
          // 秘密鍵はVercelでエスケープされる場合があるため、改行コードを正しく処理
          email: process.env.SA_CLIENT_EMAIL,
          key: process.env.SA_PRIVATE_KEY?.replace(/\\n/g, '\n'), // ここで \n を実際の改行に置換
          scopes: ['https://www.googleapis.com/auth/spreadsheets'], // スプレッドシートAPIへのアクセス権限
        });

        try { // スプレッドシートアクセスと認証ロジック全体をtry-catchブロックで囲み、エラーを捕捉
          // Google スプレッドシートのドキュメントオブジェクトを作成
          const doc = new GoogleSpreadsheet(
            process.env.USER_SPREADSHEET_ID!, // 環境変数からスプレッドシートIDを取得 (アサーション`!`で非nullを保証)
            serviceAccountAuth // 作成したサービスアカウント認証オブジェクトを使用
          );

          // スプレッドシートの情報をロード (この時点で認証とスプレッドシートへのアクセス試行が行われる)
          await doc.loadInfo();
          console.log('  Spreadsheet loaded successfully. Title:', doc.title); // ロード成功時のログ

          // 最初のシート（インデックス0）にアクセス
          const sheet = doc.sheetsByIndex[0];
          console.log('  Accessing sheet:', sheet.title, 'with header row:', sheet.headerValues); // アクセスシートのタイトルとヘッダーをログ

          // シートからすべての行を取得 (ユーザーデータ)
          const rows = await sheet.getRows();
          console.log('  Number of rows found in spreadsheet:', rows.length); // 取得した行数をログ

          // 入力されたユーザー名に基づいてスプレッドシートからユーザーを検索
          // userDB は GoogleSpreadsheetRow オブジェクト、または見つからない場合は undefined
          const userDB = rows.find(
            (row) => row.get('ユーザーID') === credentials?.username
          );

          // ユーザーが見つかったかどうかのログ
          console.log('  User found in spreadsheet (userDB exists):', !!userDB);

          if (userDB) {
              // 見つかったユーザーの情報をログ出力 (パスワードはデバッグ目的に限定し、本番では避ける)
              console.log('  UserDB properties - ユーザーID:', userDB.get('ユーザーID'));
              console.log('  UserDB properties - パスワード (from sheet):', userDB.get('パスワード')); // ★注意: 本番環境では削除！
              console.log('  Input Username (from form):', credentials?.username);
              console.log('  Input Password (from form):', credentials?.password); // ★注意: 本番環境では削除！
              console.log('  Password Match Check:', userDB.get('パスワード') === credentials?.password); // パスワード一致の真偽値
          }


          // ユーザーが見つからなかった場合の処理
          if (!userDB) {
            console.log('  Authentication failed: User not found in spreadsheet for username:', credentials?.username);
          } else {
            // ユーザーが見つかり、パスワードが一致した場合の処理
            if (userDB.get('パスワード') === credentials?.password) {
              // 認証成功！ユーザーオブジェクトを構築
              user = {
                email: JSON.stringify({ role: userDB.get('権限') }), // email にロール情報を含めている
                name: credentials?.username!, // 入力されたユーザー名
                id: credentials?.username!,   // 入力されたユーザー名
                role: userDB.get('権限'),     // スプレッドシートから取得した権限
              };
              console.log('  Authentication successful. User role:', user.role); // 成功時のログ
            } else {
              // ユーザーは見つかったがパスワードが一致しない場合の処理
              console.log('  Authentication failed: Password mismatch for user:', credentials?.username); // パスワード不一致時のログ
            }
          }

          // 認証結果に基づいてユーザーオブジェクトを返す
          if (user) {
            console.log('--- Returning user object from authorize function (Authentication SUCCESS). ---'); // 成功ルートの最終ログ
            return user;
          } else {
            console.log('--- Returning null from authorize function (Authentication FAILED). ---'); // 失敗ルートの最終ログ
            return null; // 認証失敗時は null を返す
          }

        } catch (error) {
          // tryブロック内でエラーが発生した場合
          console.error('--- START Spreadsheet Access / Authentication Error (CAUGHT) ---'); // エラー捕捉開始のログ
          console.error('Error during spreadsheet access or authentication:');
          console.error(error); // エラーオブジェクト全体をログに出力
          if (error instanceof Error) {
              console.error('Error Name:', error.name);
              console.error('Error Message:', error.message);
              console.error('Error Stack:', error.stack);
          }
          console.error('--- END Spreadsheet Access / Authentication Error (CAUGHT) ---'); // エラー捕捉終了のログ
          return null; // エラーが発生した場合は認証失敗として null を返す
        } finally {
          console.log('--- END NextAuth Authorize Function Debug Log ---'); // authorize関数の最終的な終了ログ (try/catch/finallyブロックの外で実行)
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
  },
});

export { handler as GET, handler as POST };
